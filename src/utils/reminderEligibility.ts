import type { LembreteEnvioTipo } from '../types/lembrete'
import type { TodoLembreteTipo } from '../types/todo'

export interface ReminderTaskFields {
  lembrete_email: boolean
  lembrete_tipo: TodoLembreteTipo
  data_prevista: string | null
  status: string
}

export interface ReminderDateParts {
  today: string
  tomorrow: string
}

/** YYYY-MM-DD in the given IANA timezone. */
export function getDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function addDaysToDateOnly(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isPastReminderHorario(now: Date, timezone: string, horarioLocal: string): boolean {
  const [hour, minute] = horarioLocal.split(':').map(Number)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now)

  const currentHour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const currentMinute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)

  if (currentHour > hour) return true
  if (currentHour === hour && currentMinute >= minute) return true
  return false
}

export function isActiveTaskForReminder(status: string): boolean {
  return status === 'pendente' || status === 'em_andamento'
}

/** Which reminder send types apply to this task on the reference calendar day. */
export function getReminderSendTypesForTask(
  task: ReminderTaskFields,
  dates: ReminderDateParts
): LembreteEnvioTipo[] {
  if (!task.lembrete_email || !task.data_prevista || !isActiveTaskForReminder(task.status)) {
    return []
  }

  const types: LembreteEnvioTipo[] = []
  const due = task.data_prevista

  if (due < dates.today) {
    types.push('vencida')
    return types
  }

  if (due === dates.today && (task.lembrete_tipo === 'no_dia' || task.lembrete_tipo === 'ambos')) {
    types.push('no_dia')
  }

  if (
    due === dates.tomorrow &&
    (task.lembrete_tipo === 'um_dia_antes' || task.lembrete_tipo === 'ambos')
  ) {
    types.push('um_dia_antes')
  }

  return types
}

export function getLembreteShortLabel(tipo: TodoLembreteTipo): string {
  if (tipo === 'no_dia') return 'Lembrete · No dia'
  if (tipo === 'um_dia_antes') return 'Lembrete · 1 dia antes'
  return 'Lembrete · No dia e antes'
}
