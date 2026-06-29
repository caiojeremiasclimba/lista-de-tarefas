import { useState, useEffect, useCallback, useMemo } from 'react'
import { TODO_STATUS_CONFIG, TODO_STATUSES } from '../constants/todoStatus'
import { supabase } from '../lib/supabase'
import type { Todo, TodoFormData, TodoStatus } from '../types/todo'
import { sortActiveTodos, sortFinalTodos } from '../utils/sortTodos'
import { formatTodayHeader } from '../utils/formatTodoDate'
import { isTodoOverdue } from '../utils/todoDue'
import FilterSidebar, { type FiltroCounts, type FiltroTarefas } from './FilterSidebar'
import SearchBar from './SearchBar'
import TaskSection from './TaskSection'
import TodoForm from './TodoForm'
import { LogOutIcon, PlusIcon } from './TodosUi'

interface TodosScreenProps {
  userEmail: string
  onLogout: () => void
}

type SecoesAbertas = Record<TodoStatus | 'vencidas', boolean>

const SECOES_INICIAIS: SecoesAbertas = {
  pendente: true,
  em_andamento: true,
  concluida: true,
  cancelada: true,
  vencidas: true,
}

export default function TodosScreen({ userEmail, onLogout }: TodosScreenProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTarefas>('todas')
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [secoesAbertas, setSecoesAbertas] = useState<SecoesAbertas>(SECOES_INICIAIS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { title, subtitle } = formatTodayHeader()

  const fetchTodos = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('tarefas')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTodos(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  function openNewTaskForm() {
    setEditingTodo(null)
    setShowForm(true)
  }

  function openEditForm(todo: Todo) {
    setEditingTodo(todo)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTodo(null)
  }

  async function handleSubmit(data: TodoFormData) {
    const payload = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim() || null,
      data_prevista: data.data_prevista || null,
      status: data.status,
    }

    if (editingTodo) {
      const { data: updated, error: updateError } = await supabase
        .from('tarefas')
        .update(payload)
        .eq('id', editingTodo.id)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? updated : t)))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: created, error: insertError } = await supabase
        .from('tarefas')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      setTodos((prev) => [created, ...prev])
    }

    closeForm()
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase.from('tarefas').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setTodos((prev) => prev.filter((t) => t.id !== id))
    if (editingTodo?.id === id) {
      closeForm()
    }
  }

  async function handleToggleStatus(todo: Todo) {
    if (todo.status === 'cancelada') return

    const newStatus = todo.status === 'concluida' ? 'pendente' : 'concluida'

    const { data: updated, error: updateError } = await supabase
      .from('tarefas')
      .update({ status: newStatus })
      .eq('id', todo.id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
  }

  const termo = busca.toLowerCase()
  const filtradosPorBusca = useMemo(
    () =>
      todos.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termo) ||
          (t.descricao ?? '').toLowerCase().includes(termo)
      ),
    [todos, termo]
  )

  const porStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      TODO_STATUSES.map((status) => [
        status,
        filtradosPorBusca.filter((t) => t.status === status),
      ])
    ) as Record<TodoStatus, Todo[]>

    grouped.pendente = sortActiveTodos(grouped.pendente)
    grouped.em_andamento = sortActiveTodos(grouped.em_andamento)
    grouped.concluida = sortFinalTodos(grouped.concluida)
    grouped.cancelada = sortFinalTodos(grouped.cancelada)

    return grouped
  }, [filtradosPorBusca])

  const vencidas = useMemo(
    () => sortActiveTodos(filtradosPorBusca.filter((t) => isTodoOverdue(t))),
    [filtradosPorBusca]
  )

  const counts: FiltroCounts = useMemo(
    () => ({
      todas: filtradosPorBusca.length,
      pendente: porStatus.pendente.length,
      em_andamento: porStatus.em_andamento.length,
      concluida: porStatus.concluida.length,
      cancelada: porStatus.cancelada.length,
      vencidas: vencidas.length,
    }),
    [filtradosPorBusca.length, porStatus, vencidas.length]
  )

  function toggleSecao(key: TodoStatus | 'vencidas') {
    setSecoesAbertas((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

  const secoesVisiveis =
    filtroAtivo === 'todas'
      ? TODO_STATUSES
      : filtroAtivo === 'vencidas'
        ? []
        : [filtroAtivo]

  return (
    <div className="relative h-dvh overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>

      <aside className="fixed inset-y-0 left-0 z-10 flex h-dvh w-56 flex-col overflow-hidden border-r border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <FilterSidebar active={filtroAtivo} onChange={setFiltroAtivo} counts={counts} />
        </div>

        <div className="shrink-0 border-t border-slate-200/60 px-4 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600"
              aria-hidden
            >
              {userInitial}
            </div>
            <p className="min-w-0 truncate text-sm text-slate-500">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOutIcon />
            Sair
          </button>
        </div>
      </aside>

      <div className="relative ml-56 flex h-dvh w-[calc(100%-14rem)] min-w-0 flex-col overflow-hidden">
        <main className="min-h-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-6 pb-24 sm:px-6">
          <header className="text-left">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
          </header>

          <SearchBar value={busca} onChange={setBusca} />

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {loading ? (
            <p className="text-center text-slate-500">Carregando tarefas...</p>
          ) : (
            <div className="space-y-10">
              {filtroAtivo === 'vencidas' ? (
                <TaskSection
                  title="VENCIDAS"
                  variant="vencidas"
                  todos={vencidas}
                  isOpen={secoesAbertas.vencidas}
                  onToggle={() => toggleSecao('vencidas')}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ) : (
                secoesVisiveis.map((status) => (
                  <TaskSection
                    key={status}
                    title={TODO_STATUS_CONFIG[status].sectionTitle}
                    variant={status}
                    todos={porStatus[status]}
                    isOpen={secoesAbertas[status]}
                    onToggle={() => toggleSecao(status)}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </div>
          )}
        </main>

        <button
          type="button"
          onClick={openNewTaskForm}
          aria-label="Nova tarefa"
          className="fixed bottom-6 right-4 z-20 flex items-center gap-2 rounded-full bg-blue-600 p-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 sm:bottom-8 sm:right-6 sm:px-6 sm:py-3.5 sm:text-base"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nova tarefa</span>
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TodoForm
              editingTodo={editingTodo}
              onSubmit={handleSubmit}
              onClose={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}
