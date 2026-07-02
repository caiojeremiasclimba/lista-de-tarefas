import { useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { TODO_STATUS_CONFIG } from '../constants/todoStatus'
import { useAppShell } from '../hooks/useAppShell'
import { useCategorias } from '../hooks/useCategorias'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { useTodoFilters } from '../hooks/useTodoFilters'
import { useTodos } from '../hooks/useTodos'
import { toast } from '../lib/toast'
import type { TodoFormData } from '../types/todo'
import { formatTodayHeader } from '../utils/formatTodoDate'
import ProductivityDashboard from './ProductivityDashboard'
import ProfileScreen from './ProfileScreen'
import AppShell from './todos/AppShell'
import TaskModals from './todos/TaskModals'
import TasksView from './todos/TasksView'
import { PlusIcon } from './TodosUi'

interface TodosScreenProps {
  user: User
  onLogout: () => void
}

export default function TodosScreen({ user, onLogout }: TodosScreenProps) {
  const { confirm, confirmDialog } = useConfirmDialog()

  const shell = useAppShell()
  const {
    todos,
    loading,
    loadTodos,
    submitTodo,
    deleteTodo,
    handleToggleStatus,
    handleToggleSubtarefa,
    unlinkCategoriaFromTodos,
  } = useTodos(user.id)

  const reloadTodos = useCallback(() => loadTodos(), [loadTodos])

  const { categorias, handleCreateCategoria, handleUpdateCategoria, executeDeleteCategoria } =
    useCategorias({
      userId: user.id,
      unlinkCategoriaFromTodos,
      filtroCategoria: shell.filtroCategoria,
      setFiltroCategoria: shell.setFiltroCategoria,
      reloadTodos,
    })

  const filters = useTodoFilters({
    todos,
    categorias,
    busca: shell.busca,
    filtroAtivo: shell.filtroAtivo,
    filtroCategoria: shell.filtroCategoria,
  })

  const { title, subtitle } = formatTodayHeader()

  const mobileHeaderTitle =
    shell.view === 'dashboard' ? 'Dashboard' : shell.view === 'perfil' ? 'Meu perfil' : title

  const mobileHeaderSubtitle = useMemo(() => {
    if (shell.view !== 'tarefas') return null
    if (shell.filtroCategoria && filters.categoriaAtivaNome) return filters.categoriaAtivaNome
    if (shell.filtroAtivo === 'vencidas') return 'Vencidas'
    if (shell.filtroAtivo !== 'todas') return TODO_STATUS_CONFIG[shell.filtroAtivo].label
    return subtitle
  }, [shell.view, shell.filtroCategoria, shell.filtroAtivo, filters.categoriaAtivaNome, subtitle])

  async function handleSubmitTodo(data: TodoFormData) {
    await submitTodo(data, shell.editingTodo)
    shell.closeForm()
    toast.success(
      shell.editingTodo ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.'
    )
  }

  async function handleSubmitCategoria(nome: string) {
    if (shell.editingCategoria) {
      await handleUpdateCategoria(shell.editingCategoria.id, nome)
      toast.success('Categoria atualizada com sucesso.')
    } else {
      await handleCreateCategoria(nome)
      toast.success('Categoria criada com sucesso.')
    }
    shell.closeCategoriaForm()
  }

  async function handleDeleteTodo(id: string) {
    const ok = await confirm({
      title: 'Excluir tarefa',
      description: 'Deseja excluir esta tarefa?',
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return

    const deleted = await deleteTodo(id, {
      editingTodoId: shell.editingTodo?.id,
      onCloseForm: shell.closeForm,
    })
    if (deleted) {
      toast.success('Tarefa excluída com sucesso.')
    }
  }

  async function handleDeleteCategoria(id: string) {
    const qtd = todos.filter((t) => t.categoria_id === id).length
    const description =
      qtd > 0
        ? `Excluir esta categoria? ${qtd} tarefa(s) ficarão sem categoria.`
        : 'Deseja excluir esta categoria?'

    const ok = await confirm({
      title: 'Excluir categoria',
      description,
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return

    const deleted = await executeDeleteCategoria(id)
    if (deleted) {
      toast.success('Categoria excluída com sucesso.')
    }
  }

  const fab =
    shell.view === 'tarefas' ? (
      <button
        type="button"
        onClick={shell.openNewTaskForm}
        aria-label="Nova tarefa"
        className="fixed bottom-6 right-4 z-20 flex items-center gap-2 rounded-full bg-blue-600 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 sm:bottom-8 sm:right-6 sm:px-6 sm:py-3.5 sm:pb-3.5 sm:text-base"
      >
        <PlusIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Nova tarefa</span>
      </button>
    ) : undefined

  return (
    <>
      <AppShell
        user={user}
        onLogout={onLogout}
        sidebarOpen={shell.sidebarOpen}
        onCloseSidebar={shell.closeSidebar}
        onOpenSidebar={() => shell.setSidebarOpen(true)}
        view={shell.view}
        onViewChange={shell.handleViewChange}
        onOpenPerfil={() => shell.setView('perfil')}
        mobileHeaderTitle={mobileHeaderTitle}
        mobileHeaderSubtitle={mobileHeaderSubtitle}
        filtroAtivo={shell.filtroAtivo}
        onFiltroChange={shell.handleFiltroChange}
        counts={filters.counts}
        categorias={categorias}
        filtroCategoria={shell.filtroCategoria}
        countsPorCategoria={filters.countsPorCategoria}
        onCategoriaChange={shell.handleCategoriaChange}
        onNovaCategoria={shell.openNovaCategoriaForm}
        onEditCategoria={shell.openEditCategoriaForm}
        onDeleteCategoria={handleDeleteCategoria}
        fab={fab}
      >
        {shell.view === 'dashboard' ? (
          <ProductivityDashboard todos={todos} loading={loading} />
        ) : shell.view === 'perfil' ? (
          <ProfileScreen user={user} />
        ) : (
          <TasksView
            busca={shell.busca}
            onBuscaChange={shell.setBusca}
            loading={loading}
            filtroAtivo={shell.filtroAtivo}
            tarefasVisiveis={filters.tarefasVisiveis}
            listaVaziaMensagem={filters.listaVaziaMensagem}
            porStatus={filters.porStatus}
            vencidas={filters.vencidas}
            secoesVisiveis={filters.secoesVisiveis}
            secoesAbertas={shell.secoesAbertas}
            onToggleSecao={shell.toggleSecao}
            onEdit={shell.openEditForm}
            onDelete={handleDeleteTodo}
            onToggleStatus={handleToggleStatus}
            onToggleSubtarefa={handleToggleSubtarefa}
            categoriasPorId={filters.categoriasPorId}
          />
        )}
      </AppShell>

      <TaskModals
        showForm={shell.showForm}
        showCategoriaForm={shell.showCategoriaForm}
        editingTodo={shell.editingTodo}
        editingCategoria={shell.editingCategoria}
        newTaskCategoriaId={shell.newTaskCategoriaId}
        categorias={categorias}
        onCloseForm={shell.closeForm}
        onCloseCategoriaForm={shell.closeCategoriaForm}
        onSubmitTodo={handleSubmitTodo}
        onSubmitCategoria={handleSubmitCategoria}
      />

      {confirmDialog}
    </>
  )
}
