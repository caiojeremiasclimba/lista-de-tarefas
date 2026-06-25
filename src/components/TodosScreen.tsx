import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Todo, TodoFormData } from '../types/todo'
import { formatTodayHeader } from '../utils/formatTodoDate'
import FilterTabs, { type FiltroTarefas } from './FilterTabs'
import SearchBar from './SearchBar'
import TaskSection from './TaskSection'
import TodoForm from './TodoForm'
import { LogOutIcon, PlusIcon } from './TodosUi'

interface TodosScreenProps {
  userEmail: string
  onLogout: () => void
}

export default function TodosScreen({ userEmail, onLogout }: TodosScreenProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTarefas>('todas')
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [secoesAbertas, setSecoesAbertas] = useState({ pendentes: true, concluidas: true })
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
  const filtradosPorBusca = todos.filter(
    (t) =>
      t.titulo.toLowerCase().includes(termo) ||
      (t.descricao ?? '').toLowerCase().includes(termo)
  )

  const pendentes = filtradosPorBusca.filter((t) => t.status === 'pendente')
  const concluidas = filtradosPorBusca.filter((t) => t.status === 'concluida')

  const showPendentes = filtroAtivo === 'todas' || filtroAtivo === 'pendentes'
  const showConcluidas = filtroAtivo === 'todas' || filtroAtivo === 'concluidas'
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
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

      <main className="relative mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-8 pb-32 sm:px-8">
        <header className="text-left">
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-base text-slate-500">{subtitle}</p>
        </header>

        <SearchBar value={busca} onChange={setBusca} />

        <FilterTabs
          active={filtroAtivo}
          onChange={setFiltroAtivo}
          counts={{
            todas: filtradosPorBusca.length,
            pendentes: pendentes.length,
            concluidas: concluidas.length,
          }}
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-slate-500">Carregando tarefas...</p>
        ) : (
          <div className="space-y-10">
            {showPendentes && (
              <TaskSection
                title="PENDENTES"
                variant="pending"
                todos={pendentes}
                isOpen={secoesAbertas.pendentes}
                onToggle={() =>
                  setSecoesAbertas((prev) => ({ ...prev, pendentes: !prev.pendentes }))
                }
                onEdit={openEditForm}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}

            {showConcluidas && (
              <TaskSection
                title="CONCLUÍDAS"
                variant="completed"
                todos={concluidas}
                isOpen={secoesAbertas.concluidas}
                onToggle={() =>
                  setSecoesAbertas((prev) => ({ ...prev, concluidas: !prev.concluidas }))
                }
                onEdit={openEditForm}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        )}
      </main>

      <button
        type="button"
        onClick={openNewTaskForm}
        className="fixed bottom-24 right-8 z-20 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
      >
        <PlusIcon className="h-5 w-5" />
        Nova tarefa
      </button>

      <footer className="relative h-16 shrink-0 border-t border-slate-200/40 bg-transparent px-6 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600"
              aria-hidden
            >
              {userInitial}
            </div>
            <p className="truncate text-sm text-slate-500">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/60 hover:text-slate-800"
          >
            <LogOutIcon />
            Sair
          </button>
        </div>
      </footer>

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
