import { createSubtarefaDraft } from '../types/subtarefa'
import { makeSubtarefa, makeTodo } from '../test/fixtures/todos'
import { createMockQueryBuilder, mockFrom } from '../test/mocks/supabase'
import {
  fetchTodoWithSubtarefas,
  insertSubtarefas,
  mergeTodoSubtarefas,
  syncSubtarefas,
} from './subtarefaSync'

describe('mergeTodoSubtarefas', () => {
  it('preserva subtarefas do todo existente', () => {
    const subtarefas = [makeSubtarefa({ id: 'sub-1' })]
    const updated = makeTodo({ id: 'todo-1', titulo: 'Atualizado' })
    const existing = makeTodo({ id: 'todo-1', subtarefas })

    expect(mergeTodoSubtarefas(updated, existing).subtarefas).toEqual(subtarefas)
  })

  it('usa subtarefas do updated quando não há existing', () => {
    const subtarefas = [makeSubtarefa({ id: 'sub-2' })]
    const updated = makeTodo({ subtarefas })

    expect(mergeTodoSubtarefas(updated).subtarefas).toEqual(subtarefas)
  })
})

describe('insertSubtarefas', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('retorna array vazio quando não há drafts válidos', async () => {
    const result = await insertSubtarefas('todo-1', 'user-1', [
      createSubtarefaDraft({ titulo: '   ' }),
    ])

    expect(result).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('insere drafts com título e retorna dados do banco', async () => {
    const inserted = [makeSubtarefa({ id: 'sub-new', titulo: 'Nova subtarefa' })]
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: inserted, error: null }))

    const result = await insertSubtarefas('todo-1', 'user-1', [
      createSubtarefaDraft({ titulo: 'Nova subtarefa' }),
    ])

    expect(mockFrom).toHaveBeenCalledWith('subtarefas')
    expect(result).toEqual(inserted)
  })

  it('lança erro quando insert falha', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'Falha no insert' } })
    )

    await expect(
      insertSubtarefas('todo-1', 'user-1', [createSubtarefaDraft({ titulo: 'Subtarefa' })])
    ).rejects.toThrow('Falha no insert')
  })
})

describe('syncSubtarefas', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('remove subtarefas que não estão mais nos drafts', async () => {
    const deleteBuilder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(deleteBuilder)

    const existing = [
      makeSubtarefa({ id: 'sub-1', titulo: 'Manter' }),
      makeSubtarefa({ id: 'sub-2', titulo: 'Remover' }),
    ]

    await syncSubtarefas(
      'todo-1',
      'user-1',
      [createSubtarefaDraft({ id: 'sub-1', titulo: 'Manter' })],
      existing
    )

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(deleteBuilder.in).toHaveBeenCalledWith('id', ['sub-2'])
  })

  it('atualiza subtarefa existente quando título muda', async () => {
    const updateBuilder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(updateBuilder)

    const existing = [makeSubtarefa({ id: 'sub-1', titulo: 'Antigo', ordem: 0 })]

    await syncSubtarefas(
      'todo-1',
      'user-1',
      [createSubtarefaDraft({ id: 'sub-1', titulo: 'Novo título' })],
      existing
    )

    expect(updateBuilder.update).toHaveBeenCalledWith({ titulo: 'Novo título' })
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'sub-1')
  })

  it('insere nova subtarefa sem id', async () => {
    const insertBuilder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(insertBuilder)

    await syncSubtarefas('todo-1', 'user-1', [createSubtarefaDraft({ titulo: 'Nova' })], [])

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      tarefa_id: 'todo-1',
      user_id: 'user-1',
      titulo: 'Nova',
      ordem: 0,
      concluida: false,
    })
  })
})

describe('fetchTodoWithSubtarefas', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('retorna tarefa com subtarefas do banco', async () => {
    const todo = makeTodo({
      id: 'todo-1',
      subtarefas: [makeSubtarefa({ id: 'sub-1' })],
    })
    const builder = createMockQueryBuilder({ data: todo, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await fetchTodoWithSubtarefas('todo-1')

    expect(mockFrom).toHaveBeenCalledWith('tarefas')
    expect(builder.eq).toHaveBeenCalledWith('id', 'todo-1')
    expect(result).toEqual(todo)
  })

  it('lança erro quando fetch falha', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'Não encontrado' } })
    )

    await expect(fetchTodoWithSubtarefas('todo-404')).rejects.toThrow('Não encontrado')
  })
})
