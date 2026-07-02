import { makeSubtarefa } from '../test/fixtures/todos'
import { getSubtarefaProgress } from './subtarefaProgress'

describe('getSubtarefaProgress', () => {
  it('retorna zeros quando subtarefas é undefined', () => {
    expect(getSubtarefaProgress(undefined)).toEqual({ concluidas: 0, total: 0 })
  })

  it('retorna zeros para lista vazia', () => {
    expect(getSubtarefaProgress([])).toEqual({ concluidas: 0, total: 0 })
  })

  it('conta concluídas e total corretamente', () => {
    const subtarefas = [
      makeSubtarefa({ id: '1', concluida: true }),
      makeSubtarefa({ id: '2', concluida: false }),
      makeSubtarefa({ id: '3', concluida: true }),
    ]

    expect(getSubtarefaProgress(subtarefas)).toEqual({ concluidas: 2, total: 3 })
  })
})
