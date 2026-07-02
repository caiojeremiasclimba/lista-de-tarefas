import { makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import { isTodoOverdue } from './todoDue'

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
