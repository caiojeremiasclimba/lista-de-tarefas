import { makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import { sortActiveTodos, sortFinalTodos, sortTodos } from './sortTodos'

describe('sortActiveTodos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('coloca tarefas vencidas antes das não vencidas', () => {
    const overdue = makeTodo({ id: 'overdue', data_prevista: '2026-07-01', status: 'pendente' })
    const future = makeTodo({ id: 'future', data_prevista: '2026-07-10', status: 'pendente' })
    const input = [future, overdue]

    const sorted = sortActiveTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['overdue', 'future'])
  })

  it('mantém ordem estável quando ambas têm a mesma prioridade (sem data)', () => {
    const a = makeTodo({ id: 'a', data_prevista: null })
    const b = makeTodo({ id: 'b', data_prevista: null })
    const input = [a, b]

    const sorted = sortActiveTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('ordena por data prevista crescente quando ambas não estão vencidas', () => {
    const later = makeTodo({ id: 'later', data_prevista: '2026-07-10' })
    const sooner = makeTodo({ id: 'sooner', data_prevista: '2026-07-05' })
    const input = [later, sooner]

    const sorted = sortActiveTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['sooner', 'later'])
  })

  it('coloca tarefas sem data por último', () => {
    const withDate = makeTodo({ id: 'with-date', data_prevista: '2026-07-10' })
    const noDate = makeTodo({ id: 'no-date', data_prevista: null })
    const input = [noDate, withDate]

    const sorted = sortActiveTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['with-date', 'no-date'])
  })

  it('ordena por prioridade quando datas são iguais', () => {
    const alta = makeTodo({ id: 'alta', data_prevista: '2026-07-10', prioridade: 'alta' })
    const baixa = makeTodo({ id: 'baixa', data_prevista: '2026-07-10', prioridade: 'baixa' })
    const media = makeTodo({ id: 'media', data_prevista: '2026-07-10', prioridade: 'media' })
    const input = [baixa, media, alta]

    const sorted = sortActiveTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['alta', 'media', 'baixa'])
  })

  it('não altera o array original', () => {
    const input = [
      makeTodo({ id: 'a', data_prevista: '2026-07-10' }),
      makeTodo({ id: 'b', data_prevista: '2026-07-01', status: 'pendente' }),
    ]
    const copy = [...input]

    sortActiveTodos(input)

    expect(input).toEqual(copy)
  })
})

describe('sortTodos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ordena por título em ordem alfabética', () => {
    const input = [
      makeTodo({ id: 'z', titulo: 'Zebra' }),
      makeTodo({ id: 'a', titulo: 'Abacaxi' }),
      makeTodo({ id: 'm', titulo: 'Manga' }),
    ]

    expect(sortTodos(input, 'titulo', 'active').map((t) => t.id)).toEqual(['a', 'm', 'z'])
  })

  it('ordena por prioridade sem priorizar vencidas', () => {
    const input = [
      makeTodo({ id: 'baixa', prioridade: 'baixa', data_prevista: '2026-07-01' }),
      makeTodo({ id: 'alta', prioridade: 'alta', data_prevista: '2026-07-10' }),
    ]

    expect(sortTodos(input, 'prioridade', 'active').map((t) => t.id)).toEqual(['alta', 'baixa'])
  })

  it('ordena concluídas por completed_at em modo recentes', () => {
    const input = [
      makeTodo({
        id: 'older',
        status: 'concluida',
        completed_at: '2026-01-01T00:00:00.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
      }),
      makeTodo({
        id: 'newer',
        status: 'concluida',
        completed_at: '2026-06-01T00:00:00.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ]

    expect(sortTodos(input, 'recentes', 'final').map((t) => t.id)).toEqual(['newer', 'older'])
  })
})

describe('sortFinalTodos', () => {
  it('ordena por created_at decrescente', () => {
    const older = makeTodo({
      id: 'older',
      status: 'concluida',
      created_at: '2026-01-01T00:00:00.000Z',
    })
    const newer = makeTodo({
      id: 'newer',
      status: 'concluida',
      created_at: '2026-06-01T00:00:00.000Z',
    })
    const input = [older, newer]

    const sorted = sortFinalTodos(input)

    expect(sorted.map((t) => t.id)).toEqual(['newer', 'older'])
  })

  it('não altera o array original', () => {
    const input = [
      makeTodo({ id: 'a', status: 'concluida', created_at: '2026-01-01T00:00:00.000Z' }),
      makeTodo({ id: 'b', status: 'concluida', created_at: '2026-06-01T00:00:00.000Z' }),
    ]
    const copy = [...input]

    sortFinalTodos(input)

    expect(input).toEqual(copy)
  })
})
