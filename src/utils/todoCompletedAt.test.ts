import { completedAtForStatusChange } from './todoCompletedAt'

describe('completedAtForStatusChange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T15:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna null quando novo status não é concluída', () => {
    expect(completedAtForStatusChange('pendente', 'em_andamento')).toBeNull()
    expect(completedAtForStatusChange('cancelada', 'concluida')).toBeNull()
  })

  it('gera ISO string ao concluir pela primeira vez', () => {
    expect(completedAtForStatusChange('concluida', 'pendente')).toBe(
      '2026-07-02T15:30:00.000Z'
    )
  })

  it('preserva completed_at ao reabrir e concluir de novo', () => {
    const existing = '2026-06-01T10:00:00.000Z'

    expect(
      completedAtForStatusChange('concluida', 'concluida', existing)
    ).toBe(existing)
  })

  it('gera novo timestamp se já era concluída mas sem completed_at', () => {
    expect(completedAtForStatusChange('concluida', 'concluida', null)).toBe(
      '2026-07-02T15:30:00.000Z'
    )
  })
})
