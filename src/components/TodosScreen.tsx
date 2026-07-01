import { useState, useEffect, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { TODO_STATUS_CONFIG, TODO_STATUSES, getNextStatusOnToggle } from '../constants/todoStatus'
import { supabase } from '../lib/supabase'
import type { Categoria } from '../types/categoria'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo, TodoFormData, TodoStatus } from '../types/todo'
import { sortActiveTodos, sortFinalTodos } from '../utils/sortTodos'
import { completedAtForStatusChange } from '../utils/todoCompletedAt'
import { formatTodayHeader } from '../utils/formatTodoDate'
import { isTodoOverdue } from '../utils/todoDue'
import {
  fetchTodoWithSubtarefas,
  insertSubtarefas,
  mergeTodoSubtarefas,
  syncSubtarefas,
} from '../utils/subtarefaSync'
import {
  ATTACHMENT_DB_FIELDS,
  removeAttachment,
  uploadAttachment,
} from '../utils/attachmentStorage'
import { getUserDisplayName } from '../utils/userDisplay'
import CategoriaForm from './CategoriaForm'
import FilterSidebar, { type AppView, type FiltroCounts, type FiltroTarefas } from './FilterSidebar'
import ProductivityDashboard from './ProductivityDashboard'
import ProfileScreen from './ProfileScreen'
import UserAvatar from './UserAvatar'
import SearchBar from './SearchBar'
import TaskSection from './TaskSection'
import TodoForm from './TodoForm'
import { LogOutIcon, MenuIcon, PlusIcon, XIcon } from './TodosUi'

interface TodosScreenProps {
  user: User
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

export default function TodosScreen({ user, onLogout }: TodosScreenProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTarefas>('todas')
  const [view, setView] = useState<AppView>('tarefas')
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategoriaForm, setShowCategoriaForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTaskCategoriaId, setNewTaskCategoriaId] = useState<string | null>(null)
  const [secoesAbertas, setSecoesAbertas] = useState<SecoesAbertas>(SECOES_INICIAIS)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const { title, subtitle } = formatTodayHeader()

  const fetchCategorias = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('categorias')
      .select('*')
      .order('nome')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCategorias(data ?? [])
    }
  }, [])

  const fetchTodos = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('tarefas')
      .select('*, subtarefas(*)')
      .order('created_at', { ascending: false })
      .order('ordem', { foreignTable: 'subtarefas', ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTodos(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTodos()
    fetchCategorias()
  }, [fetchTodos, fetchCategorias])

  useEffect(() => {
    if (!sidebarOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  function handleViewChange(next: AppView) {
    setView(next)
    closeSidebar()
  }

  function handleFiltroChange(filtro: FiltroTarefas) {
    setFiltroAtivo(filtro)
    closeSidebar()
  }

  function handleCategoriaChange(id: string | null) {
    setFiltroCategoria(id)
    closeSidebar()
  }

  function openNewTaskForm() {
    setNewTaskCategoriaId(filtroCategoria)
    setEditingTodo(null)
    setShowForm(true)
    closeSidebar()
  }

  function openEditForm(todo: Todo) {
    setEditingTodo(todo)
    setShowForm(true)
    closeSidebar()
  }

  function closeForm() {
    setShowForm(false)
    setEditingTodo(null)
    setNewTaskCategoriaId(null)
  }

  function openNovaCategoriaForm() {
    setEditingCategoria(null)
    setShowCategoriaForm(true)
    closeSidebar()
  }

  function openEditCategoriaForm(categoria: Categoria) {
    setEditingCategoria(categoria)
    setShowCategoriaForm(true)
    closeSidebar()
  }

  function closeCategoriaForm() {
    setShowCategoriaForm(false)
    setEditingCategoria(null)
  }

  async function handleCreateCategoria(nome: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data: created, error: insertError } = await supabase
      .from('categorias')
      .insert({ nome, user_id: user.id })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)
    if (!created) throw new Error('Categoria criada, mas não foi possível carregá-la.')

    closeCategoriaForm()

    setCategorias((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)))
    setFiltroCategoria(created.id)
  }

  async function handleUpdateCategoria(id: string, nome: string) {
    const { data: updated, error: updateError } = await supabase
      .from('categorias')
      .update({ nome })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    if (!updated) throw new Error('Categoria atualizada, mas não foi possível carregá-la.')

    closeCategoriaForm()

    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.nome.localeCompare(b.nome))
    )
  }

  async function handleDeleteCategoria(id: string) {
    const qtd = todos.filter((t) => t.categoria_id === id).length

    const mensagem =
      qtd > 0
        ? `Excluir esta categoria? ${qtd} tarefa(s) ficarão sem categoria.`
        : 'Deseja excluir esta categoria?'

    if (!window.confirm(mensagem)) return

    if (qtd > 0) {
      const { error: unlinkError } = await supabase
        .from('tarefas')
        .update({ categoria_id: null })
        .eq('categoria_id', id)

      if (unlinkError) {
        setError(unlinkError.message)
        return
      }
    }

    const { error: deleteError } = await supabase.from('categorias').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setCategorias((prev) => prev.filter((c) => c.id !== id))
    if (filtroCategoria === id) setFiltroCategoria(null)
    setTodos((prev) =>
      prev.map((t) => (t.categoria_id === id ? { ...t, categoria_id: null } : t))
    )
  }

  async function handleSubmitCategoria(nome: string) {
    if (editingCategoria) {
      await handleUpdateCategoria(editingCategoria.id, nome)
    } else {
      await handleCreateCategoria(nome)
    }
  }

  async function syncTodoAnexo(
    tarefaId: string,
    userId: string,
    data: TodoFormData,
    existing?: Todo | null
  ) {
    if (data.removerAnexo && existing?.anexo_path) {
      await removeAttachment(existing.anexo_path)

      const { error } = await supabase
        .from('tarefas')
        .update(ATTACHMENT_DB_FIELDS)
        .eq('id', tarefaId)

      if (error) throw new Error(error.message)
      return
    }

    if (!data.anexoFile) return

    const metadata = await uploadAttachment(userId, tarefaId, data.anexoFile)

    const { error } = await supabase
      .from('tarefas')
      .update({
        anexo_path: metadata.path,
        anexo_nome: metadata.nome,
        anexo_mime: metadata.mime,
      })
      .eq('id', tarefaId)

    if (error) {
      await removeAttachment(metadata.path)
      throw new Error(error.message)
    }

    if (existing?.anexo_path && existing.anexo_path !== metadata.path) {
      await removeAttachment(existing.anexo_path)
    }
  }

  async function handleSubmit(data: TodoFormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const payload = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim() || null,
      data_prevista: data.data_prevista || null,
      status: data.status,
      categoria_id: data.categoria_id || null,
      completed_at: completedAtForStatusChange(
        data.status,
        editingTodo?.status,
        editingTodo?.completed_at
      ),
    }

    if (editingTodo) {
      const { error: updateError } = await supabase
        .from('tarefas')
        .update(payload)
        .eq('id', editingTodo.id)

      if (updateError) throw new Error(updateError.message)

      await syncSubtarefas(editingTodo.id, user.id, data.subtarefas, editingTodo.subtarefas)
      await syncTodoAnexo(editingTodo.id, user.id, data, editingTodo)
      const refreshed = await fetchTodoWithSubtarefas(editingTodo.id)

      setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? refreshed : t)))
    } else {
      const { data: created, error: insertError } = await supabase
        .from('tarefas')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      const subtarefas = await insertSubtarefas(created.id, user.id, data.subtarefas)

      if (data.anexoFile) {
        await syncTodoAnexo(created.id, user.id, data)
        const refreshed = await fetchTodoWithSubtarefas(created.id)
        setTodos((prev) => [refreshed, ...prev])
      } else {
        setTodos((prev) => [{ ...created, subtarefas }, ...prev])
      }
    }

    closeForm()
  }

  async function handleDelete(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (todo?.anexo_path) {
      await removeAttachment(todo.anexo_path)
    }

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

    const newStatus = getNextStatusOnToggle(todo.status)
    const completed_at = completedAtForStatusChange(
      newStatus,
      todo.status,
      todo.completed_at
    )

    const { data: updated, error: updateError } = await supabase
      .from('tarefas')
      .update({ status: newStatus, completed_at })
      .eq('id', todo.id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setTodos((prev) => prev.map((t) => (t.id === todo.id ? mergeTodoSubtarefas(updated, t) : t)))
  }

  async function handleToggleSubtarefa(sub: Subtarefa) {
    const parent = todos.find((t) => t.id === sub.tarefa_id)
    if (!parent || parent.status === 'cancelada') return

    const { data: updated, error: updateError } = await supabase
      .from('subtarefas')
      .update({ concluida: !sub.concluida })
      .eq('id', sub.id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setTodos((prev) =>
      prev.map((t) =>
        t.id !== sub.tarefa_id
          ? t
          : {
              ...t,
              subtarefas: t.subtarefas?.map((s) => (s.id === sub.id ? updated : s)) ?? [],
            }
      )
    )
  }

  const termo = busca.toLowerCase()

  const filtradosParaContadores = useMemo(
    () =>
      todos.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termo) ||
          (t.descricao ?? '').toLowerCase().includes(termo) ||
          (t.subtarefas?.some((s) => s.titulo.toLowerCase().includes(termo)) ?? false)
      ),
    [todos, termo]
  )

  const filtradosPorCategoria = useMemo(() => {
    if (!filtroCategoria) return filtradosParaContadores
    return filtradosParaContadores.filter((t) => t.categoria_id === filtroCategoria)
  }, [filtradosParaContadores, filtroCategoria])

  const filtradosPorBusca = filtradosPorCategoria

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

  const countsPorCategoria = useMemo(
    () =>
      Object.fromEntries(
        categorias.map((c) => [
          c.id,
          filtradosParaContadores.filter((t) => t.categoria_id === c.id).length,
        ])
      ),
    [filtradosParaContadores, categorias]
  )

  const counts: FiltroCounts = useMemo(
    () => ({
      todas: filtradosPorCategoria.length,
      pendente: filtradosPorCategoria.filter((t) => t.status === 'pendente').length,
      em_andamento: filtradosPorCategoria.filter((t) => t.status === 'em_andamento').length,
      concluida: filtradosPorCategoria.filter((t) => t.status === 'concluida').length,
      cancelada: filtradosPorCategoria.filter((t) => t.status === 'cancelada').length,
      vencidas: filtradosPorCategoria.filter((t) => isTodoOverdue(t)).length,
    }),
    [filtradosPorCategoria]
  )

  const categoriasPorId = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id, c.nome])),
    [categorias]
  )

  function toggleSecao(key: TodoStatus | 'vencidas') {
    setSecoesAbertas((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const displayName = getUserDisplayName(user)

  const categoriaAtivaNome = filtroCategoria
    ? categorias.find((c) => c.id === filtroCategoria)?.nome
    : null

  const secoesVisiveis =
    filtroAtivo === 'todas'
      ? TODO_STATUSES
      : filtroAtivo === 'vencidas'
        ? []
        : [filtroAtivo]

  const mobileHeaderTitle =
    view === 'dashboard' ? 'Dashboard' : view === 'perfil' ? 'Meu perfil' : title

  const mobileHeaderSubtitle = useMemo(() => {
    if (view !== 'tarefas') return null
    if (filtroCategoria && categoriaAtivaNome) return categoriaAtivaNome
    if (filtroAtivo === 'vencidas') return 'Vencidas'
    if (filtroAtivo !== 'todas') return TODO_STATUS_CONFIG[filtroAtivo].label
    return subtitle
  }, [view, filtroCategoria, categoriaAtivaNome, filtroAtivo, subtitle])

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

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 max-w-[85vw] flex-col overflow-hidden border-r border-slate-200/60 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-out md:z-10 md:w-56 md:max-w-none md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/60 px-3 py-3 md:hidden">
          <span className="text-sm font-semibold text-slate-800">Menu</span>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <FilterSidebar
            view={view}
            onViewChange={handleViewChange}
            active={filtroAtivo}
            onChange={handleFiltroChange}
            counts={counts}
            categorias={categorias}
            categoriaAtiva={filtroCategoria}
            countsPorCategoria={countsPorCategoria}
            onCategoriaChange={handleCategoriaChange}
            onNovaCategoria={openNovaCategoriaForm}
            onEditCategoria={openEditCategoriaForm}
            onDeleteCategoria={handleDeleteCategoria}
          />
        </div>

        <div className="shrink-0 border-t border-slate-200/60 px-4 py-4">
          <button
            type="button"
            onClick={() => handleViewChange('perfil')}
            aria-label="Abrir perfil"
            className="flex min-w-0 w-full items-center gap-2.5 rounded-xl px-1 py-1 transition hover:bg-slate-50"
          >
            <UserAvatar user={user} size="sm" />
            <p className="min-w-0 truncate text-sm text-slate-500">{displayName}</p>
          </button>
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

      <div className="relative flex h-dvh w-full min-w-0 flex-col overflow-hidden md:ml-56 md:w-[calc(100%-14rem)]">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/60 bg-white/70 px-3 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{mobileHeaderTitle}</p>
            {mobileHeaderSubtitle && (
              <p className="truncate text-xs text-slate-500">{mobileHeaderSubtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setView('perfil')}
            aria-label="Abrir perfil"
            className="shrink-0 rounded-full transition hover:ring-2 hover:ring-blue-200"
          >
            <UserAvatar user={user} size="sm" />
          </button>
        </header>

        <main className="min-h-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-6 pb-24 sm:px-6">
          {view === 'dashboard' ? (
            <ProductivityDashboard todos={todos} loading={loading} />
          ) : view === 'perfil' ? (
            <ProfileScreen user={user} />
          ) : (
            <>
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
          ) : filtradosPorBusca.length === 0 && filtroCategoria && categoriaAtivaNome ? (
            <p className="text-center text-slate-500">
              Nenhuma tarefa em &ldquo;{categoriaAtivaNome}&rdquo;
            </p>
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
                  onToggleSubtarefa={handleToggleSubtarefa}
                  categoriasPorId={categoriasPorId}
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
                    onToggleSubtarefa={handleToggleSubtarefa}
                    categoriasPorId={categoriasPorId}
                  />
                ))
              )}
            </div>
          )}
            </>
          )}
        </main>

        {view === 'tarefas' && (
        <button
          type="button"
          onClick={openNewTaskForm}
          aria-label="Nova tarefa"
          className="fixed bottom-6 right-4 z-20 flex items-center gap-2 rounded-full bg-blue-600 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 sm:bottom-8 sm:right-6 sm:px-6 sm:py-3.5 sm:pb-3.5 sm:text-base"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nova tarefa</span>
        </button>
        )}
      </div>

      {showCategoriaForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center md:inset-y-0 md:left-56 md:right-0"
          onClick={closeCategoriaForm}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CategoriaForm
              editingCategoria={editingCategoria}
              onSubmit={handleSubmitCategoria}
              onClose={closeCategoriaForm}
            />
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center md:inset-y-0 md:left-56 md:right-0"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TodoForm
              editingTodo={editingTodo}
              categorias={categorias}
              defaultCategoriaId={newTaskCategoriaId}
              onSubmit={handleSubmit}
              onClose={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}
