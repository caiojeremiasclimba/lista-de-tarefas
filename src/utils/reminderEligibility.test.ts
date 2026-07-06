import { describe, expect, it } from 'vitest'
import {
  addDaysToDateOnly,
  getDateInTimezone,
  getReminderSendTypesForTask,
  isPastReminderHorario,
} from './reminderEligibility'
import { makeTodo } from '../test/fixtures/todos'

describe('getReminderSendTypesForTask', () => {
  const dates = { today: '2026-07-02', tomorrow: '2026-07-03' }

  it('retorna no_dia para tarefa com lembrete no dia', () => {
    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          lembrete_tipo: 'no_dia',
          data_prevista: '2026-07-02',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual(['no_dia'])
  })

  it('retorna um_dia_antes quando configurado', () => {
    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          lembrete_tipo: 'um_dia_antes',
          data_prevista: '2026-07-03',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual(['um_dia_antes'])
  })

  it('retorna ambos os tipos quando configurado', () => {
    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          lembrete_tipo: 'ambos',
          data_prevista: '2026-07-02',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual(['no_dia'])

    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          lembrete_tipo: 'ambos',
          data_prevista: '2026-07-03',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual(['um_dia_antes'])
  })

  it('retorna vencida para tarefas atrasadas', () => {
    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          lembrete_tipo: 'no_dia',
          data_prevista: '2026-06-01',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual(['vencida'])
  })

  it('ignora tarefas sem lembrete ou concluídas', () => {
    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: false,
          data_prevista: '2026-07-02',
          status: 'pendente',
        }),
        dates
      )
    ).toEqual([])

    expect(
      getReminderSendTypesForTask(
        makeTodo({
          lembrete_email: true,
          data_prevista: '2026-07-02',
          status: 'concluida',
        }),
        dates
      )
    ).toEqual([])
  })
})

describe('isPastReminderHorario', () => {
  it('retorna true após o horário configurado no fuso', () => {
    const now = new Date('2026-07-02T12:00:00.000Z')
    expect(isPastReminderHorario(now, 'America/Sao_Paulo', '08:00')).toBe(true)
  })

  it('retorna false antes do horário configurado', () => {
    const now = new Date('2026-07-02T10:00:00.000Z')
    expect(isPastReminderHorario(now, 'America/Sao_Paulo', '08:00')).toBe(false)
  })
})

describe('getDateInTimezone', () => {
  it('formata data no fuso informado', () => {
    const date = new Date('2026-07-02T15:00:00.000Z')
    expect(getDateInTimezone(date, 'America/Sao_Paulo')).toBe('2026-07-02')
  })
})

describe('addDaysToDateOnly', () => {
  it('soma dias em string YYYY-MM-DD', () => {
    expect(addDaysToDateOnly('2026-07-02', 1)).toBe('2026-07-03')
  })
})
