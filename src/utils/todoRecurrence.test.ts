import { makeTodo } from '../test/fixtures/todos'
import {
  getNextRecurringDate,
  isRecurringTodo,
  shouldCreateNextOccurrence,
  shouldCreateNextOnSave,
} from './todoRecurrence'

describe('isRecurringTodo', () => {
  it('retorna false para recorrencia nenhuma', () => {
    expect(isRecurringTodo(makeTodo({ recorrencia_tipo: 'nenhuma' }))).toBe(false)
  })

  it('retorna true para recorrencia ativa', () => {
    expect(isRecurringTodo(makeTodo({ recorrencia_tipo: 'semanal' }))).toBe(true)
  })
})

describe('getNextRecurringDate', () => {
  it('calcula proxima data diaria', () => {
    expect(getNextRecurringDate('2026-07-02', 'diaria', 1)).toBe('2026-07-03')
  })

  it('calcula proxima data semanal com intervalo', () => {
    expect(getNextRecurringDate('2026-07-02', 'semanal', 2)).toBe('2026-07-16')
  })

  it('calcula proxima data mensal', () => {
    expect(getNextRecurringDate('2026-07-02', 'mensal', 1)).toBe('2026-08-02')
  })

  it('limita dia mensal ao fim do mes', () => {
    expect(getNextRecurringDate('2026-01-31', 'mensal', 1)).toBe('2026-02-28')
  })

  it('respeita fevereiro em ano bissexto', () => {
    expect(getNextRecurringDate('2028-01-31', 'mensal', 1)).toBe('2028-02-29')
  })

  it('retorna null para recorrencia nenhuma', () => {
    expect(getNextRecurringDate('2026-07-02', 'nenhuma', 1)).toBeNull()
  })

  it('retorna null para data invalida', () => {
    expect(getNextRecurringDate('2026-02-31', 'diaria', 1)).toBeNull()
  })
})

describe('shouldCreateNextOccurrence', () => {
  it('retorna true ao concluir tarefa recorrente com proxima data dentro do limite', () => {
    expect(
      shouldCreateNextOccurrence(
        makeTodo({
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_fim: '2026-07-20',
        }),
        'concluida'
      )
    ).toBe(true)
  })

  it('retorna false quando o novo status nao e concluida', () => {
    expect(
      shouldCreateNextOccurrence(
        makeTodo({ data_prevista: '2026-07-02', recorrencia_tipo: 'semanal' }),
        'em_andamento'
      )
    ).toBe(false)
  })

  it('retorna false quando a proxima data passa do limite', () => {
    expect(
      shouldCreateNextOccurrence(
        makeTodo({
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_fim: '2026-07-05',
        }),
        'concluida'
      )
    ).toBe(false)
  })
})

describe('shouldCreateNextOnSave', () => {
  it('retorna true ao salvar tarefa recorrente como concluida', () => {
    expect(
      shouldCreateNextOnSave(
        {
          status: 'concluida',
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_intervalo: 1,
          recorrencia_fim: '',
        },
        'pendente'
      )
    ).toBe(true)
  })

  it('retorna false ao re-salvar tarefa ja concluida', () => {
    expect(
      shouldCreateNextOnSave(
        {
          status: 'concluida',
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_intervalo: 1,
          recorrencia_fim: '',
        },
        'concluida'
      )
    ).toBe(false)
  })

  it('retorna false quando status salvo nao e concluida', () => {
    expect(
      shouldCreateNextOnSave(
        {
          status: 'em_andamento',
          data_prevista: '2026-07-02',
          recorrencia_tipo: 'semanal',
          recorrencia_intervalo: 1,
          recorrencia_fim: '',
        },
        'pendente'
      )
    ).toBe(false)
  })
})
