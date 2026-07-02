import { getNextStatusOnToggle, isFinalStatus } from './todoStatus'

describe('isFinalStatus', () => {
  it('retorna false para status ativos', () => {
    expect(isFinalStatus('pendente')).toBe(false)
    expect(isFinalStatus('em_andamento')).toBe(false)
  })

  it('retorna true para status finais', () => {
    expect(isFinalStatus('concluida')).toBe(true)
    expect(isFinalStatus('cancelada')).toBe(true)
  })
})

describe('getNextStatusOnToggle', () => {
  it('avança pendente para em_andamento', () => {
    expect(getNextStatusOnToggle('pendente')).toBe('em_andamento')
  })

  it('avança em_andamento para concluida', () => {
    expect(getNextStatusOnToggle('em_andamento')).toBe('concluida')
  })

  it('reabre concluida para pendente', () => {
    expect(getNextStatusOnToggle('concluida')).toBe('pendente')
  })

  it('mantém cancelada inalterada', () => {
    expect(getNextStatusOnToggle('cancelada')).toBe('cancelada')
  })
})
