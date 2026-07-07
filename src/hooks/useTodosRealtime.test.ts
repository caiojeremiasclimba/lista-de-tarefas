import { makeSubtarefa, makeTodo } from '../test/fixtures/todos'
import { createTodosRealtimeHandler } from './useTodosRealtime'

const mockFetchTodoWithSubtarefas = vi.hoisted(() => vi.fn())

vi.mock('../utils/subtarefaSync', () => ({
  fetchTodoWithSubtarefas: mockFetchTodoWithSubtarefas,
}))

describe('createTodosRealtimeHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockFetchTodoWithSubtarefas.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('remove tarefa ao receber DELETE em tarefas', () => {
    const setTodos = vi.fn()
    const loadTodos = vi.fn()
    const handler = createTodosRealtimeHandler({ setTodos, loadTodos })

    handler({
      table: 'tarefas',
      eventType: 'DELETE',
      new: undefined,
      old: { id: 'todo-1' },
    })

    expect(setTodos).toHaveBeenCalled()
    const updater = setTodos.mock.calls[0][0] as (prev: ReturnType<typeof makeTodo>[]) => unknown
    const result = updater([makeTodo({ id: 'todo-1' }), makeTodo({ id: 'todo-2' })])
    expect(result).toEqual([makeTodo({ id: 'todo-2' })])
    expect(loadTodos).not.toHaveBeenCalled()
  })

  it('busca tarefa completa ao receber INSERT sem subtarefas', async () => {
    const setTodos = vi.fn()
    const loadTodos = vi.fn()
    const inserted = makeTodo({ id: 'todo-2', titulo: 'Nova' })
    mockFetchTodoWithSubtarefas.mockResolvedValue(inserted)

    const handler = createTodosRealtimeHandler({ setTodos, loadTodos })
    handler({
      table: 'tarefas',
      eventType: 'INSERT',
      new: inserted as unknown as Record<string, unknown>,
      old: undefined,
    })

    await vi.waitFor(() => expect(mockFetchTodoWithSubtarefas).toHaveBeenCalledWith('todo-2'))
    expect(setTodos).toHaveBeenCalled()
  })

  it('atualiza subtarefa no pai sem refetch total', () => {
    const setTodos = vi.fn()
    const loadTodos = vi.fn()
    const handler = createTodosRealtimeHandler({ setTodos, loadTodos })
    const sub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1', concluida: true })

    handler({
      table: 'subtarefas',
      eventType: 'UPDATE',
      new: sub as unknown as Record<string, unknown>,
      old: undefined,
    })

    expect(setTodos).toHaveBeenCalled()
    expect(loadTodos).not.toHaveBeenCalled()
  })

  it('agenda refetch total com debounce quando payload é inválido', () => {
    const setTodos = vi.fn()
    const loadTodos = vi.fn().mockResolvedValue(undefined)
    const handler = createTodosRealtimeHandler({ setTodos, loadTodos })

    handler({
      table: 'tarefas',
      eventType: 'UPDATE',
      new: undefined,
      old: undefined,
    })

    expect(loadTodos).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(loadTodos).toHaveBeenCalledTimes(1)
  })
})
