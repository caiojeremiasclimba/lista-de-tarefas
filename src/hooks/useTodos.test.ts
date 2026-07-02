import { act, renderHook, waitFor } from '@testing-library/react'
import { makeSubtarefa, makeTodo, makeTodoFormData } from '../test/fixtures/todos'
import { useTodos } from './useTodos'

const { mockFetchTodos, mockSaveTodo, mockDeleteTodo, mockToggleTodoStatus, mockToggleSubtarefa } =
  vi.hoisted(() => ({
    mockFetchTodos: vi.fn(),
    mockSaveTodo: vi.fn(),
    mockDeleteTodo: vi.fn(),
    mockToggleTodoStatus: vi.fn(),
    mockToggleSubtarefa: vi.fn(),
  }))

vi.mock('../services/todoService', () => ({
  fetchTodos: mockFetchTodos,
  saveTodo: mockSaveTodo,
  deleteTodo: mockDeleteTodo,
  toggleTodoStatus: mockToggleTodoStatus,
  toggleSubtarefa: mockToggleSubtarefa,
}))

describe('useTodos', () => {
  const onError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchTodos.mockResolvedValue([makeTodo({ id: 'todo-1' })])
  })

  it('carrega tarefas ao montar', async () => {
    const { result } = renderHook(() => useTodos({ onError }))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockFetchTodos).toHaveBeenCalled()
    expect(result.current.todos).toHaveLength(1)
    expect(onError).toHaveBeenCalledWith(null)
  })

  it('chama onError quando fetch falha', async () => {
    mockFetchTodos.mockRejectedValue(new Error('Falha na rede'))

    renderHook(() => useTodos({ onError }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Falha na rede'))
  })

  it('adiciona tarefa nova após submitTodo', async () => {
    const saved = makeTodo({ id: 'new-todo', titulo: 'Nova' })
    mockSaveTodo.mockResolvedValue(saved)

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.submitTodo(makeTodoFormData({ titulo: 'Nova' }))
    })

    expect(result.current.todos[0]).toEqual(saved)
  })

  it('atualiza tarefa existente após submitTodo', async () => {
    const existing = makeTodo({ id: 'todo-1', titulo: 'Antigo' })
    const updated = makeTodo({ id: 'todo-1', titulo: 'Novo' })
    mockFetchTodos.mockResolvedValue([existing])
    mockSaveTodo.mockResolvedValue(updated)

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.submitTodo(makeTodoFormData({ titulo: 'Novo' }), existing)
    })

    expect(result.current.todos[0].titulo).toBe('Novo')
  })

  it('remove tarefa e chama onCloseForm quando aplicável', async () => {
    const todo = makeTodo({ id: 'todo-1' })
    mockFetchTodos.mockResolvedValue([todo])
    mockDeleteTodo.mockResolvedValue(undefined)
    const onCloseForm = vi.fn()

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteTodo('todo-1', {
        editingTodoId: 'todo-1',
        onCloseForm,
      })
    })

    expect(result.current.todos).toHaveLength(0)
    expect(onCloseForm).toHaveBeenCalled()
  })

  it('ignora toggle de status para tarefa cancelada', async () => {
    const cancelada = makeTodo({ id: 'todo-1', status: 'cancelada' })
    mockFetchTodos.mockResolvedValue([cancelada])

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleToggleStatus(cancelada)
    })

    expect(mockToggleTodoStatus).not.toHaveBeenCalled()
  })

  it('desvincula categoria das tarefas localmente', async () => {
    const todo = makeTodo({ id: 'todo-1', categoria_id: 'cat-1' })
    mockFetchTodos.mockResolvedValue([todo])

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.unlinkCategoriaFromTodos('cat-1')
    })

    expect(result.current.todos[0].categoria_id).toBeNull()
  })

  it('chama onError e mantém lista quando deleteTodo falha', async () => {
    const todo = makeTodo({ id: 'todo-1', anexo_path: 'path/file.pdf' })
    mockFetchTodos.mockResolvedValue([todo])
    mockDeleteTodo.mockRejectedValue(new Error('Erro ao excluir'))

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteTodo('todo-1')
    })

    expect(result.current.todos).toHaveLength(1)
    expect(onError).toHaveBeenCalledWith('Erro ao excluir')
  })

  it('chama onError e não altera status quando toggle falha', async () => {
    const todo = makeTodo({ id: 'todo-1', status: 'pendente' })
    mockFetchTodos.mockResolvedValue([todo])
    mockToggleTodoStatus.mockRejectedValue(new Error('Erro ao atualizar status'))

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleToggleStatus(todo)
    })

    expect(result.current.todos[0].status).toBe('pendente')
    expect(onError).toHaveBeenCalledWith('Erro ao atualizar status')
  })

  it('ignora toggle de subtarefa quando tarefa pai está cancelada', async () => {
    const sub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1' })
    const cancelada = makeTodo({ id: 'todo-1', status: 'cancelada', subtarefas: [sub] })
    mockFetchTodos.mockResolvedValue([cancelada])

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleToggleSubtarefa(sub)
    })

    expect(mockToggleSubtarefa).not.toHaveBeenCalled()
  })

  it('atualiza subtarefa localmente após toggle bem-sucedido', async () => {
    const sub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1', concluida: false })
    const updatedSub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1', concluida: true })
    const todo = makeTodo({ id: 'todo-1', subtarefas: [sub] })
    mockFetchTodos.mockResolvedValue([todo])
    mockToggleSubtarefa.mockResolvedValue(updatedSub)

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleToggleSubtarefa(sub)
    })

    expect(result.current.todos[0].subtarefas?.[0].concluida).toBe(true)
  })

  it('chama onError quando toggle de subtarefa falha', async () => {
    const sub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1' })
    const todo = makeTodo({ id: 'todo-1', subtarefas: [sub] })
    mockFetchTodos.mockResolvedValue([todo])
    mockToggleSubtarefa.mockRejectedValue(new Error('Erro ao atualizar subtarefa'))

    const { result } = renderHook(() => useTodos({ onError }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleToggleSubtarefa(sub)
    })

    expect(result.current.todos[0].subtarefas?.[0].concluida).toBe(false)
    expect(onError).toHaveBeenCalledWith('Erro ao atualizar subtarefa')
  })
})
