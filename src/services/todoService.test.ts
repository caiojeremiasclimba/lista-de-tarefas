import { makeSubtarefa, makeTodo, makeTodoFormData } from '../test/fixtures/todos'
import { makeFile } from '../test/fixtures/user'
import { createSubtarefaDraft } from '../types/subtarefa'
import {
  AUTH_USER,
  createMockQueryBuilder,
  mockAuthenticatedUser,
  mockFrom,
  mockGetUser,
  mockUnauthenticatedUser,
} from '../test/mocks/supabase'
import { deleteTodo, fetchTodos, saveTodo, toggleSubtarefa, toggleTodoStatus } from './todoService'

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
    expect(result.updatedTodo.subtarefas).toEqual(subtarefas)
    expect(result.createdNextTodo).toBeNull()
  })

  it('cria próxima ocorrência ao concluir tarefa recorrente', async () => {
    const subtarefas = [
      makeSubtarefa({ id: 'sub-1', titulo: 'Checklist', concluida: true, ordem: 0 }),
    ]
    const todo = makeTodo({
      id: 'todo-1',
      status: 'em_andamento',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas,
    })
    const updated = makeTodo({
      id: 'todo-1',
      status: 'concluida',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: undefined,
    })
    const next = makeTodo({
      id: 'todo-2',
      status: 'pendente',
      data_prevista: '2026-07-09',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      recorrencia_origem_id: 'todo-1',
      subtarefas: undefined,
    })
    const nextSubtarefas = [
      makeSubtarefa({
        id: 'sub-2',
        tarefa_id: 'todo-2',
        titulo: 'Checklist',
        concluida: false,
      }),
    ]
    const updateBuilder = createMockQueryBuilder({ data: updated, error: null })
    const insertTodoBuilder = createMockQueryBuilder({ data: next, error: null })
    const insertSubtarefasBuilder = createMockQueryBuilder({
      data: nextSubtarefas,
      error: null,
    })

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        return tarefasCalls === 1 ? updateBuilder : insertTodoBuilder
      }
      return insertSubtarefasBuilder
    })

    const result = await toggleTodoStatus(todo)

    expect(updateBuilder.update).toHaveBeenCalledWith({
      status: 'concluida',
      completed_at: '2026-07-02T12:00:00.000Z',
    })
    expect(insertTodoBuilder.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      titulo: 'Tarefa teste',
      descricao: null,
      data_prevista: '2026-07-09',
      status: 'pendente',
      prioridade: 'media',
      categoria_id: null,
      completed_at: null,
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      recorrencia_fim: null,
      recorrencia_origem_id: 'todo-1',
      lembrete_email: false,
      lembrete_tipo: 'no_dia',
    })
    expect(insertSubtarefasBuilder.insert).toHaveBeenCalledWith([
      {
        tarefa_id: 'todo-2',
        user_id: 'user-1',
        titulo: 'Checklist',
        ordem: 0,
        concluida: false,
      },
    ])
    expect(result.updatedTodo.subtarefas).toEqual(subtarefas)
    expect(result.createdNextTodo).toEqual({ ...next, subtarefas: nextSubtarefas })
  })

  it('desfaz conclusão quando falha ao criar próxima ocorrência', async () => {
    const todo = makeTodo({
      id: 'todo-1',
      status: 'em_andamento',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
    })
    const updated = makeTodo({
      id: 'todo-1',
      status: 'concluida',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
    })
    const updateBuilder = createMockQueryBuilder({ data: updated, error: null })
    const insertTodoBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'Falha ao criar próxima ocorrência' },
    })
    const rollbackBuilder = createMockQueryBuilder({ data: null, error: null })

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) return updateBuilder
        if (tarefasCalls === 2) return insertTodoBuilder
        return rollbackBuilder
      }
      return createMockQueryBuilder({ data: [], error: null })
    })

    await expect(toggleTodoStatus(todo)).rejects.toThrow('Falha ao criar próxima ocorrência')

    expect(updateBuilder.update).toHaveBeenCalledWith({
      status: 'concluida',
      completed_at: '2026-07-02T12:00:00.000Z',
    })
    expect(rollbackBuilder.update).toHaveBeenCalledWith({
      status: 'em_andamento',
      completed_at: null,
    })
    expect(tarefasCalls).toBe(3)
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
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await saveTodo(makeTodoFormData({ titulo: 'Nova tarefa' }))

    expect(builder.insert).toHaveBeenCalledWith({
      titulo: 'Nova tarefa',
      descricao: null,
      data_prevista: null,
      status: 'pendente',
      prioridade: 'media',
      categoria_id: null,
      recorrencia_tipo: 'nenhuma',
      recorrencia_intervalo: 1,
      recorrencia_fim: null,
      completed_at: null,
      lembrete_email: false,
      lembrete_tipo: 'no_dia',
      user_id: AUTH_USER.id,
    })
    expect(result).toEqual({ savedTodo: { ...created, subtarefas: [] }, createdNextTodo: null })
  })

  it('inclui recorrência no payload de criação', async () => {
    mockAuthenticatedUser()
    const created = makeTodo({
      id: 'new-todo',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'mensal',
      recorrencia_intervalo: 2,
      recorrencia_fim: '2026-12-31',
    })
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    await saveTodo(
      makeTodoFormData({
        data_prevista: '2026-07-02',
        recorrencia_tipo: 'mensal',
        recorrencia_intervalo: 2,
        recorrencia_fim: '2026-12-31',
      })
    )

    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        data_prevista: '2026-07-02',
        recorrencia_tipo: 'mensal',
        recorrencia_intervalo: 2,
        recorrencia_fim: '2026-12-31',
      })
    )
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

    const result = await saveTodo(makeTodoFormData({ titulo: 'Atualizado' }), editingTodo)

    expect(result).toEqual({ savedTodo: fetched, createdNextTodo: null })
  })

  it('cria próxima ocorrência ao salvar tarefa recorrente como concluída no formulário', async () => {
    mockAuthenticatedUser()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T12:00:00.000Z'))

    const editingTodo = makeTodo({
      id: 'todo-1',
      status: 'pendente',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: [makeSubtarefa({ id: 'sub-1', titulo: 'Checklist' })],
    })
    const fetched = makeTodo({
      id: 'todo-1',
      status: 'concluida',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: [makeSubtarefa({ id: 'sub-1', titulo: 'Checklist' })],
    })
    const next = makeTodo({
      id: 'todo-2',
      status: 'pendente',
      data_prevista: '2026-07-09',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      recorrencia_origem_id: 'todo-1',
      subtarefas: undefined,
    })
    const nextSubtarefas = [
      makeSubtarefa({
        id: 'sub-2',
        tarefa_id: 'todo-2',
        titulo: 'Checklist',
        concluida: false,
      }),
    ]

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        if (tarefasCalls === 2) {
          return createMockQueryBuilder({ data: fetched, error: null })
        }
        return createMockQueryBuilder({ data: next, error: null })
      }
      return createMockQueryBuilder({ data: nextSubtarefas, error: null })
    })

    const result = await saveTodo(
      makeTodoFormData({
        status: 'concluida',
        data_prevista: '2026-07-02',
        recorrencia_tipo: 'semanal',
        recorrencia_intervalo: 1,
      }),
      editingTodo
    )

    expect(result.savedTodo).toEqual(fetched)
    expect(result.createdNextTodo).toEqual({ ...next, subtarefas: nextSubtarefas })
    expect(tarefasCalls).toBe(3)

    vi.useRealTimers()
  })

  it('desfaz salvamento quando falha ao criar próxima ocorrência no formulário', async () => {
    mockAuthenticatedUser()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T12:00:00.000Z'))

    const editingTodo = makeTodo({
      id: 'todo-1',
      status: 'pendente',
      titulo: 'Original',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: [],
    })

    let tarefasUpdateCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasUpdateCalls++
        if (tarefasUpdateCalls === 1) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        if (tarefasUpdateCalls === 2) {
          return createMockQueryBuilder({
            data: makeTodo({ ...editingTodo, status: 'concluida' }),
            error: null,
          })
        }
        if (tarefasUpdateCalls === 3) {
          return createMockQueryBuilder({
            data: null,
            error: { message: 'Falha ao criar próxima ocorrência' },
          })
        }
        return createMockQueryBuilder({ data: null, error: null })
      }
      return createMockQueryBuilder({ data: [], error: null })
    })

    await expect(
      saveTodo(
        makeTodoFormData({
          titulo: 'Alterado',
          status: 'concluida',
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_intervalo: 1,
        }),
        editingTodo
      )
    ).rejects.toThrow('Falha ao criar próxima ocorrência')

    expect(tarefasUpdateCalls).toBe(4)

    vi.useRealTimers()
  })

  it('cria nova tarefa com anexo e busca registro atualizado', async () => {
    mockAuthenticatedUser()
    const anexoFile = makeFile('relatorio.pdf', 'application/pdf', 1024)
    const created = makeTodo({ id: 'new-todo', titulo: 'Com anexo' })
    const fetched = makeTodo({
      id: 'new-todo',
      titulo: 'Com anexo',
      anexo_path: 'user-1/new-todo/relatorio.pdf',
      anexo_nome: 'relatorio.pdf',
      anexo_mime: 'application/pdf',
      subtarefas: [],
    })

    mockUploadAttachment.mockResolvedValue({
      path: 'user-1/new-todo/relatorio.pdf',
      nome: 'relatorio.pdf',
      mime: 'application/pdf',
    })

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: created, error: null })
        }
        if (tarefasCalls === 2) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        return createMockQueryBuilder({ data: fetched, error: null })
      }
      return createMockQueryBuilder({ data: [], error: null })
    })

    const result = await saveTodo(makeTodoFormData({ titulo: 'Com anexo', anexoFile }))

    expect(mockUploadAttachment).toHaveBeenCalledWith(AUTH_USER.id, 'new-todo', anexoFile)
    expect(result).toEqual({ savedTodo: fetched, createdNextTodo: null })
    expect(tarefasCalls).toBe(3)
  })

  it('não cria próxima ocorrência ao re-salvar tarefa já concluída', async () => {
    mockAuthenticatedUser()
    const editingTodo = makeTodo({
      id: 'todo-1',
      status: 'concluida',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: [],
    })
    const fetched = makeTodo({
      id: 'todo-1',
      titulo: 'Título atualizado',
      status: 'concluida',
      data_prevista: '2026-07-02',
      recorrencia_tipo: 'semanal',
      recorrencia_intervalo: 1,
      subtarefas: [],
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
      makeTodoFormData({
        titulo: 'Título atualizado',
        status: 'concluida',
        data_prevista: '2026-07-02',
        recorrencia_tipo: 'semanal',
        recorrencia_intervalo: 1,
      }),
      editingTodo
    )

    expect(result).toEqual({ savedTodo: fetched, createdNextTodo: null })
    expect(tarefasCalls).toBe(2)
  })

  it('faz rollback da tarefa criada quando upload do anexo falha', async () => {
    mockAuthenticatedUser()
    const created = makeTodo({ id: 'new-todo' })
    const anexoFile = makeFile('falha.pdf', 'application/pdf', 1024)
    let tarefasCalls = 0

    mockUploadAttachment.mockRejectedValue(new Error('Falha no upload'))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: created, error: null })
        }
        return createMockQueryBuilder({ data: null, error: null })
      }
      return createMockQueryBuilder({ data: [], error: null })
    })

    await expect(saveTodo(makeTodoFormData({ anexoFile }))).rejects.toThrow('Falha no upload')

    expect(tarefasCalls).toBe(2)
  })

  it('remove anexo órfão quando update do banco falha após upload', async () => {
    mockAuthenticatedUser()
    const created = makeTodo({ id: 'new-todo' })
    const anexoFile = makeFile('doc.pdf', 'application/pdf', 1024)
    const orphanPath = 'user-1/new-todo/doc.pdf'
    let tarefasCalls = 0

    mockUploadAttachment.mockResolvedValue({
      path: orphanPath,
      nome: 'doc.pdf',
      mime: 'application/pdf',
    })
    mockRemoveAttachment.mockResolvedValue(undefined)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: created, error: null })
        }
        if (tarefasCalls === 2) {
          return createMockQueryBuilder({
            data: null,
            error: { message: 'Falha ao salvar anexo' },
          })
        }
        return createMockQueryBuilder({ data: null, error: null })
      }
      return createMockQueryBuilder({ data: [], error: null })
    })

    await expect(saveTodo(makeTodoFormData({ anexoFile }))).rejects.toThrow('Falha ao salvar anexo')

    expect(mockRemoveAttachment).toHaveBeenCalledWith(orphanPath)
    expect(tarefasCalls).toBe(3)
  })

  it('remove anexo ao editar com removerAnexo', async () => {
    mockAuthenticatedUser()
    const editingTodo = makeTodo({
      id: 'todo-1',
      anexo_path: 'user-1/todo-1/antigo.pdf',
      anexo_nome: 'antigo.pdf',
      anexo_mime: 'application/pdf',
      subtarefas: [],
    })
    const fetched = makeTodo({ id: 'todo-1', subtarefas: [] })

    mockRemoveAttachment.mockResolvedValue(undefined)

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        if (tarefasCalls === 2) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        return createMockQueryBuilder({ data: fetched, error: null })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    await saveTodo(makeTodoFormData({ removerAnexo: true }), editingTodo)

    expect(mockRemoveAttachment).toHaveBeenCalledWith('user-1/todo-1/antigo.pdf')
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })

  it('substitui anexo existente ao editar com novo arquivo', async () => {
    mockAuthenticatedUser()
    const anexoFile = makeFile('novo.pdf', 'application/pdf', 1024)
    const editingTodo = makeTodo({
      id: 'todo-1',
      anexo_path: 'user-1/todo-1/antigo.pdf',
      anexo_nome: 'antigo.pdf',
      anexo_mime: 'application/pdf',
      subtarefas: [],
    })
    const fetched = makeTodo({
      id: 'todo-1',
      anexo_path: 'user-1/todo-1/novo.pdf',
      anexo_nome: 'novo.pdf',
      anexo_mime: 'application/pdf',
      subtarefas: [],
    })

    mockUploadAttachment.mockResolvedValue({
      path: 'user-1/todo-1/novo.pdf',
      nome: 'novo.pdf',
      mime: 'application/pdf',
    })
    mockRemoveAttachment.mockResolvedValue(undefined)

    let tarefasCalls = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasCalls++
        if (tarefasCalls === 1) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        if (tarefasCalls === 2) {
          return createMockQueryBuilder({ data: null, error: null })
        }
        return createMockQueryBuilder({ data: fetched, error: null })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const result = await saveTodo(makeTodoFormData({ anexoFile }), editingTodo)

    expect(mockUploadAttachment).toHaveBeenCalledWith(AUTH_USER.id, 'todo-1', anexoFile)
    expect(mockRemoveAttachment).toHaveBeenCalledWith('user-1/todo-1/antigo.pdf')
    expect(result).toEqual({ savedTodo: fetched, createdNextTodo: null })
  })

  it('faz rollback da edição quando sync de subtarefas falha', async () => {
    mockAuthenticatedUser()
    const editingTodo = makeTodo({
      id: 'todo-1',
      titulo: 'Original',
      subtarefas: [makeSubtarefa({ id: 'sub-1', titulo: 'Sub original' })],
    })

    let tarefasUpdateCalls = 0
    let subtarefasCalls = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tarefas') {
        tarefasUpdateCalls++
        return createMockQueryBuilder({ data: null, error: null })
      }

      subtarefasCalls++
      if (subtarefasCalls === 1) {
        return createMockQueryBuilder({
          data: null,
          error: { message: 'Falha ao sincronizar subtarefas' },
        })
      }

      return createMockQueryBuilder({ data: [], error: null })
    })

    await expect(
      saveTodo(
        makeTodoFormData({
          titulo: 'Alterado',
          subtarefas: [
            createSubtarefaDraft({ id: 'sub-1', titulo: 'Sub alterada' }),
            createSubtarefaDraft({ titulo: 'Sub nova' }),
          ],
        }),
        editingTodo
      )
    ).rejects.toThrow('Falha ao sincronizar subtarefas')

    expect(tarefasUpdateCalls).toBe(2)
    expect(subtarefasCalls).toBeGreaterThanOrEqual(1)
  })
})
