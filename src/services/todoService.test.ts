import { makeSubtarefa, makeTodo, makeTodoFormData } from '../test/fixtures/todos'
import { createSubtarefaDraft } from '../types/subtarefa'
import {
  createMockQueryBuilder,
  mockAuthenticatedUser,
  mockFrom,
  mockGetUser,
  mockUnauthenticatedUser,
} from '../test/mocks/supabase'
import {
  deleteTodo,
  fetchTodos,
  saveTodo,
  toggleSubtarefa,
  toggleTodoStatus,
} from './todoService'

const mockUploadAttachment = vi.hoisted(() => vi.fn())
const mockRemoveAttachment = vi.hoisted(() => vi.fn())

vi.mock('../utils/attachmentStorage', () => ({
  uploadAttachment: mockUploadAttachment,
  removeAttachment: mockRemoveAttachment,
  ATTACHMENT_DB_FIELDS: {
    anexo_path: null,
    anexo_nome: null,
    anexo_mime: null,
  },
}))

describe('fetchTodos', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('retorna lista de tarefas', async () => {
    const todos = [makeTodo({ id: 'todo-1' })]
    const builder = createMockQueryBuilder({ data: todos, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await fetchTodos()

    expect(mockFrom).toHaveBeenCalledWith('tarefas')
    expect(result).toEqual(todos)
  })

  it('lança erro quando fetch falha', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'Erro ao buscar' } })
    )

    await expect(fetchTodos()).rejects.toThrow('Erro ao buscar')
  })
})

describe('toggleTodoStatus', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('avança status e preserva subtarefas', async () => {
    const subtarefas = [makeSubtarefa({ id: 'sub-1' })]
    const todo = makeTodo({ id: 'todo-1', status: 'pendente', subtarefas })
    const updated = makeTodo({ id: 'todo-1', status: 'em_andamento', subtarefas: undefined })

    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await toggleTodoStatus(todo)

    expect(builder.update).toHaveBeenCalledWith({
      status: 'em_andamento',
      completed_at: null,
    })
    expect(result.subtarefas).toEqual(subtarefas)
  })

  it('lança erro para tarefa cancelada', async () => {
    const todo = makeTodo({ status: 'cancelada' })

    await expect(toggleTodoStatus(todo)).rejects.toThrow(
      'Tarefa cancelada não pode mudar de status'
    )
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('toggleSubtarefa', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('inverte concluida e retorna subtarefa atualizada', async () => {
    const sub = makeSubtarefa({ id: 'sub-1', concluida: false })
    const updated = makeSubtarefa({ id: 'sub-1', concluida: true })
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await toggleSubtarefa(sub)

    expect(builder.update).toHaveBeenCalledWith({ concluida: true })
    expect(result).toEqual(updated)
  })
})

describe('deleteTodo', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockRemoveAttachment.mockReset()
  })

  it('exclui tarefa e remove anexo quando informado', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)
    mockRemoveAttachment.mockResolvedValue(undefined)

    await deleteTodo('todo-1', 'user-1/todo-1/file.pdf')

    expect(builder.delete).toHaveBeenCalled()
    expect(mockRemoveAttachment).toHaveBeenCalledWith('user-1/todo-1/file.pdf')
  })

  it('conclui exclusão mesmo se remoção do anexo falhar', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)
    mockRemoveAttachment.mockRejectedValue(new Error('Storage indisponível'))

    await expect(deleteTodo('todo-1', 'path/file.pdf')).resolves.toBeUndefined()
  })
})

describe('saveTodo', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockGetUser.mockReset()
    mockUploadAttachment.mockReset()
    mockRemoveAttachment.mockReset()
  })

  it('lança erro quando usuário não está autenticado', async () => {
    mockUnauthenticatedUser()

    await expect(saveTodo(makeTodoFormData())).rejects.toThrow('Usuário não autenticado')
  })

  it('cria nova tarefa sem subtarefas', async () => {
    mockAuthenticatedUser()
    const created = makeTodo({ id: 'new-todo', titulo: 'Nova tarefa' })
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: created, error: null }))

    const result = await saveTodo(makeTodoFormData({ titulo: 'Nova tarefa' }))

    expect(result).toEqual({ ...created, subtarefas: [] })
  })

  it('faz rollback da tarefa criada quando subtarefas falham', async () => {
    mockAuthenticatedUser()
    const created = makeTodo({ id: 'new-todo' })
    let tarefasCalls = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: created, error: null })
        }
        return createMockQueryBuilder({ data: null, error: null })
      }
      return createMockQueryBuilder({
        data: null,
        error: { message: 'Falha nas subtarefas' },
      })
    })

    await expect(
      saveTodo(
        makeTodoFormData({
          subtarefas: [createSubtarefaDraft({ titulo: 'Sub 1' })],
        })
      )
    ).rejects.toThrow('Falha nas subtarefas')

    expect(tarefasCalls).toBe(2)
  })

  it('atualiza tarefa existente e retorna com subtarefas', async () => {
    mockAuthenticatedUser()
    const editingTodo = makeTodo({
      id: 'todo-1',
      titulo: 'Antigo',
      subtarefas: [makeSubtarefa({ id: 'sub-1' })],
    })
    const fetched = makeTodo({
      id: 'todo-1',
      titulo: 'Atualizado',
      subtarefas: [makeSubtarefa({ id: 'sub-1' })],
    })

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        return createMockQueryBuilder({
          data: tarefasCalls === 1 ? null : fetched,
          error: null,
        })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const result = await saveTodo(
      makeTodoFormData({ titulo: 'Atualizado' }),
      editingTodo
    )

    expect(result).toEqual(fetched)
  })
})
