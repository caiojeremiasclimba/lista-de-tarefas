import { TODO_STATUSES } from '../constants/todoStatus'
import { makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import {
  buildStatusChartData,
  calcConcluidasNaSemana,
  calcPercentConcluido,
  calcTotaisPorStatus,
  getEndOfWeek,
  getStartOfWeek,
  isInCurrentWeek,
  todosElegiveisParaConclusao,
} from './productivityStats'

/**
 * Testa métricas do dashboard de produtividade.
 * Semana de referência com FIXED_TODAY (2026-07-02, quinta): seg 29/06 a dom 05/07.
 */
describe('getStartOfWeek / getEndOfWeek', () => {
  it('calcula início da semana na segunda-feira', () => {
    const start = getStartOfWeek(FIXED_TODAY)

    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(29)
    expect(start.getMonth()).toBe(5)
  })

  it('calcula fim da semana no domingo', () => {
    const start = getStartOfWeek(FIXED_TODAY)
    const end = getEndOfWeek(start)

    expect(end.getDay()).toBe(0)
    expect(end.getDate()).toBe(5)
    expect(end.getMonth()).toBe(6)
  })
})

describe('isInCurrentWeek', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna true para data dentro da semana atual', () => {
    expect(isInCurrentWeek('2026-07-01T10:00:00.000Z')).toBe(true)
  })

  it('retorna false para data fora da semana atual', () => {
    expect(isInCurrentWeek('2026-06-01T10:00:00.000Z')).toBe(false)
  })
})

describe('todosElegiveisParaConclusao', () => {
  it('exclui tarefas canceladas', () => {
    const todos = [
      makeTodo({ id: '1', status: 'pendente' }),
      makeTodo({ id: '2', status: 'cancelada' }),
      makeTodo({ id: '3', status: 'concluida' }),
    ]

    expect(todosElegiveisParaConclusao(todos).map((t) => t.id)).toEqual(['1', '3'])
  })
})

describe('calcPercentConcluido', () => {
  it('retorna 0 quando não há tarefas elegíveis', () => {
    expect(calcPercentConcluido([makeTodo({ status: 'cancelada' })])).toBe(0)
  })

  it('ignora canceladas e arredonda a porcentagem', () => {
    const todos = [
      makeTodo({ status: 'concluida' }),
      makeTodo({ status: 'pendente' }),
      makeTodo({ status: 'em_andamento' }),
      makeTodo({ status: 'cancelada' }),
    ]

    expect(calcPercentConcluido(todos)).toBe(33)
  })
})

describe('calcTotaisPorStatus', () => {
  it('conta tarefas por status', () => {
    const todos = [
      makeTodo({ status: 'pendente' }),
      makeTodo({ status: 'pendente' }),
      makeTodo({ status: 'concluida' }),
      makeTodo({ status: 'cancelada' }),
    ]

    expect(calcTotaisPorStatus(todos)).toEqual({
      pendente: 2,
      em_andamento: 0,
      concluida: 1,
      cancelada: 1,
    })
  })
})

describe('calcConcluidasNaSemana', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('conta só concluídas com completed_at na semana atual', () => {
    const todos = [
      makeTodo({
        status: 'concluida',
        completed_at: '2026-07-01T12:00:00.000Z',
      }),
      makeTodo({
        status: 'concluida',
        completed_at: '2026-05-01T12:00:00.000Z',
      }),
      makeTodo({
        status: 'pendente',
        completed_at: null,
      }),
    ]

    expect(calcConcluidasNaSemana(todos)).toBe(1)
  })
})

describe('buildStatusChartData', () => {
  it('monta fatias do gráfico com label, valor e cor por status', () => {
    const todos = [makeTodo({ status: 'pendente' }), makeTodo({ status: 'concluida' })]

    const chart = buildStatusChartData(todos)

    expect(chart).toHaveLength(TODO_STATUSES.length)
    expect(chart.find((s) => s.status === 'pendente')).toMatchObject({
      label: 'Pendente',
      value: 1,
      color: '#94a3b8',
    })
    expect(chart.find((s) => s.status === 'concluida')).toMatchObject({
      label: 'Concluída',
      value: 1,
      color: '#16a34a',
    })
  })
})
