import { act, renderHook } from '@testing-library/react'
import { makeCategoria, makeTodo } from '../test/fixtures/todos'
import { useAppShell } from './useAppShell'

describe('useAppShell', () => {
  it('inicia com estado padrão', () => {
    const { result } = renderHook(() => useAppShell())

    expect(result.current.busca).toBe('')
    expect(result.current.filtroAtivo).toBe('todas')
    expect(result.current.view).toBe('tarefas')
    expect(result.current.showForm).toBe(false)
    expect(result.current.sidebarOpen).toBe(false)
  })

  it('abre formulário de nova tarefa com categoria do filtro ativo', () => {
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.setFiltroCategoria('cat-1')
    })

    act(() => {
      result.current.openNewTaskForm()
    })

    expect(result.current.showForm).toBe(true)
    expect(result.current.editingTodo).toBeNull()
    expect(result.current.newTaskCategoriaId).toBe('cat-1')
    expect(result.current.sidebarOpen).toBe(false)
  })

  it('abre formulário de edição com a tarefa selecionada', () => {
    const todo = makeTodo({ id: 'todo-1' })
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.openEditForm(todo)
    })

    expect(result.current.showForm).toBe(true)
    expect(result.current.editingTodo).toEqual(todo)
  })

  it('fecha formulário e limpa estado de edição', () => {
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.openEditForm(makeTodo())
      result.current.closeForm()
    })

    expect(result.current.showForm).toBe(false)
    expect(result.current.editingTodo).toBeNull()
    expect(result.current.newTaskCategoriaId).toBeNull()
  })

  it('alterna seção aberta/fechada', () => {
    const { result } = renderHook(() => useAppShell())

    expect(result.current.secoesAbertas.pendente).toBe(true)

    act(() => {
      result.current.toggleSecao('pendente')
    })

    expect(result.current.secoesAbertas.pendente).toBe(false)
  })

  it('fecha sidebar ao pressionar Escape', () => {
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.setSidebarOpen(true)
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current.sidebarOpen).toBe(false)
  })

  it('abre e fecha formulário de categoria', () => {
    const categoria = makeCategoria()
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.openEditCategoriaForm(categoria)
    })

    expect(result.current.showCategoriaForm).toBe(true)
    expect(result.current.editingCategoria).toEqual(categoria)

    act(() => {
      result.current.closeCategoriaForm()
    })

    expect(result.current.showCategoriaForm).toBe(false)
    expect(result.current.editingCategoria).toBeNull()
  })

  it('muda view e fecha sidebar', () => {
    const { result } = renderHook(() => useAppShell())

    act(() => {
      result.current.setSidebarOpen(true)
      result.current.handleViewChange('dashboard')
    })

    expect(result.current.view).toBe('dashboard')
    expect(result.current.sidebarOpen).toBe(false)
  })
})
