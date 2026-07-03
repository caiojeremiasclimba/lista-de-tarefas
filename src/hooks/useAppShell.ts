import { useCallback, useEffect, useState } from 'react'
import type { Categoria } from '../types/categoria'
import type { Todo, TodoPrioridade, TodoStatus } from '../types/todo'
import type { AppView, FiltroTarefas } from '../components/FilterSidebar'
import {
  getDefaultAppShellPreferences,
  loadAppShellPreferences,
  saveAppShellPreferences,
} from '../lib/appShellPreferences'
import type { SecoesAbertas } from '../utils/todoFilters'

function readInitialPrefs() {
  return loadAppShellPreferences() ?? getDefaultAppShellPreferences()
}

export function useAppShell() {
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTarefas>(
    () => readInitialPrefs().filtroAtivo
  )
  const [view, setView] = useState<AppView>(() => readInitialPrefs().view)
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(
    () => readInitialPrefs().filtroCategoria
  )
  const [filtroPrioridade, setFiltroPrioridade] = useState<TodoPrioridade | null>(
    () => readInitialPrefs().filtroPrioridade
  )
  const [showForm, setShowForm] = useState(false)
  const [showCategoriaForm, setShowCategoriaForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTaskCategoriaId, setNewTaskCategoriaId] = useState<string | null>(null)
  const [secoesAbertas, setSecoesAbertas] = useState<SecoesAbertas>(
    () => readInitialPrefs().secoesAbertas
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    saveAppShellPreferences({
      version: 1,
      view,
      filtroAtivo,
      filtroCategoria,
      filtroPrioridade,
      secoesAbertas,
    })
  }, [view, filtroAtivo, filtroCategoria, filtroPrioridade, secoesAbertas])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    if (!sidebarOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  const handleViewChange = useCallback(
    (next: AppView) => {
      setView(next)
      closeSidebar()
    },
    [closeSidebar]
  )

  const handleFiltroChange = useCallback(
    (filtro: FiltroTarefas) => {
      setFiltroAtivo(filtro)
      closeSidebar()
    },
    [closeSidebar]
  )

  const handleCategoriaChange = useCallback(
    (id: string | null) => {
      setFiltroCategoria(id)
      closeSidebar()
    },
    [closeSidebar]
  )

  const handlePrioridadeChange = useCallback(
    (prioridade: TodoPrioridade | null) => {
      setFiltroPrioridade(prioridade)
      closeSidebar()
    },
    [closeSidebar]
  )

  const openNewTaskForm = useCallback(() => {
    setNewTaskCategoriaId(filtroCategoria)
    setEditingTodo(null)
    setShowForm(true)
    closeSidebar()
  }, [filtroCategoria, closeSidebar])

  const openEditForm = useCallback(
    (todo: Todo) => {
      setEditingTodo(todo)
      setShowForm(true)
      closeSidebar()
    },
    [closeSidebar]
  )

  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingTodo(null)
    setNewTaskCategoriaId(null)
  }, [])

  const openNovaCategoriaForm = useCallback(() => {
    setEditingCategoria(null)
    setShowCategoriaForm(true)
    closeSidebar()
  }, [closeSidebar])

  const openEditCategoriaForm = useCallback(
    (categoria: Categoria) => {
      setEditingCategoria(categoria)
      setShowCategoriaForm(true)
      closeSidebar()
    },
    [closeSidebar]
  )

  const closeCategoriaForm = useCallback(() => {
    setShowCategoriaForm(false)
    setEditingCategoria(null)
  }, [])

  const toggleSecao = useCallback((key: TodoStatus | 'vencidas') => {
    setSecoesAbertas((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return {
    busca,
    setBusca,
    filtroAtivo,
    view,
    setView,
    filtroCategoria,
    setFiltroCategoria,
    filtroPrioridade,
    setFiltroPrioridade,
    showForm,
    showCategoriaForm,
    editingCategoria,
    editingTodo,
    newTaskCategoriaId,
    secoesAbertas,
    sidebarOpen,
    setSidebarOpen,
    closeSidebar,
    handleViewChange,
    handleFiltroChange,
    handleCategoriaChange,
    handlePrioridadeChange,
    openNewTaskForm,
    openEditForm,
    closeForm,
    openNovaCategoriaForm,
    openEditCategoriaForm,
    closeCategoriaForm,
    toggleSecao,
  }
}
