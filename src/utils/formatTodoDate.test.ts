import { FIXED_TODAY } from '../test/fixtures/todos'
import { formatTodayHeader, formatTodoDate, toDateOnly } from './formatTodoDate'

/**
 * Testa formatação de datas exibidas na UI.
 * Usa FIXED_TODAY (2026-07-02) para resultados previsíveis em "Hoje" e "Amanhã".
 */
describe('toDateOnly', () => {
  it('converte string YYYY-MM-DD em Date local', () => {
    const date = toDateOnly('2026-07-15')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(6)
    expect(date.getDate()).toBe(15)
  })
})

describe('formatTodoDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna null quando dateStr é null', () => {
    expect(formatTodoDate(null)).toBeNull()
  })

  it('retorna "Hoje" para a data de hoje', () => {
    expect(formatTodoDate('2026-07-02')).toBe('Hoje')
  })

  it('retorna "Amanhã" para o dia seguinte', () => {
    expect(formatTodoDate('2026-07-03')).toBe('Amanhã')
  })

  it('retorna DD/MM/YYYY para outras datas', () => {
    expect(formatTodoDate('2026-12-25')).toBe('25/12/2026')
  })
})

describe('formatTodayHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna título "Hoje" e subtítulo em pt-BR capitalizado', () => {
    const { title, subtitle } = formatTodayHeader()

    expect(title).toBe('Hoje')
    expect(subtitle.charAt(0)).toBe(subtitle.charAt(0).toUpperCase())
    expect(subtitle.toLowerCase()).toContain('julho')
  })
})
