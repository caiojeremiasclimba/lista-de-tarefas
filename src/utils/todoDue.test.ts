import { makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import { isTodoDueToday, isTodoOverdue } from './todoDue'

describe('isTodoOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna false quando não há data prevista', () => {
    expect(isTodoOverdue(makeTodo({ data_prevista: null }))).toBe(false)
  })

  it('retorna true para data de ontem com status pendente', () => {
    expect(isTodoOverdue(makeTodo({ data_prevista: '2026-07-01', status: 'pendente' }))).toBe(true)
  })

  it('retorna false para data de hoje', () => {
    expect(isTodoOverdue(makeTodo({ data_prevista: '2026-07-02' }))).toBe(false)
  })

  it('retorna false para data futura', () => {
    expect(isTodoOverdue(makeTodo({ data_prevista: '2026-07-10' }))).toBe(false)
  })

  it('retorna false para data passada com status concluída', () => {
    expect(
      isTodoOverdue(
        makeTodo({
          data_prevista: '2026-07-01',
          status: 'concluida',
          completed_at: '2026-07-01T10:00:00.000Z',
        })
      )
    ).toBe(false)
  })

  it('retorna false para data passada com status cancelada', () => {
    expect(isTodoOverdue(makeTodo({ data_prevista: '2026-07-01', status: 'cancelada' }))).toBe(
      false
    )
  })
})

describe('isTodoDueToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna false quando não há data prevista', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: null }))).toBe(false)
  })

  it('retorna true para data de hoje com status pendente', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: '2026-07-02', status: 'pendente' }))).toBe(true)
  })

  it('retorna true para data de hoje com status em andamento', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: '2026-07-02', status: 'em_andamento' }))).toBe(
      true
    )
  })

  it('retorna false para data de ontem', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: '2026-07-01', status: 'pendente' }))).toBe(
      false
    )
  })

  it('retorna false para data futura', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: '2026-07-10', status: 'pendente' }))).toBe(
      false
    )
  })

  it('retorna false para data de hoje com status concluída', () => {
    expect(
      isTodoDueToday(
        makeTodo({
          data_prevista: '2026-07-02',
          status: 'concluida',
          completed_at: '2026-07-02T10:00:00.000Z',
        })
      )
    ).toBe(false)
  })

  it('retorna false para data de hoje com status cancelada', () => {
    expect(isTodoDueToday(makeTodo({ data_prevista: '2026-07-02', status: 'cancelada' }))).toBe(
      false
    )
  })
})
