import type { Todo, TodoFormData, TodoRecorrenciaTipo, TodoStatus } from '../types/todo'

type RecurrenceFields = Pick<
  Todo,
  'data_prevista' | 'recorrencia_tipo' | 'recorrencia_intervalo' | 'recorrencia_fim'
>

function parseDateOnly(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeInterval(intervalo: number): number {
  if (!Number.isFinite(intervalo)) return 1
  return Math.max(1, Math.trunc(intervalo))
}

function addMonthsClamped(date: Date, months: number): Date {
  const targetStart = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(targetStart.getFullYear(), targetStart.getMonth() + 1, 0).getDate()
  return new Date(
    targetStart.getFullYear(),
    targetStart.getMonth(),
    Math.min(date.getDate(), lastDay)
  )
}

export function isRecurringTodo(todo: Pick<Todo, 'recorrencia_tipo'>): boolean {
  return todo.recorrencia_tipo !== 'nenhuma'
}

export function getNextRecurringDate(
  dataPrevista: string | null,
  tipo: TodoRecorrenciaTipo,
  intervalo: number
): string | null {
  if (!dataPrevista || tipo === 'nenhuma') return null

  const date = parseDateOnly(dataPrevista)
  if (!date) return null

  const normalizedInterval = normalizeInterval(intervalo)
  const nextDate = new Date(date)

  if (tipo === 'diaria') {
    nextDate.setDate(nextDate.getDate() + normalizedInterval)
    return formatDateOnly(nextDate)
  }

  if (tipo === 'semanal') {
    nextDate.setDate(nextDate.getDate() + normalizedInterval * 7)
    return formatDateOnly(nextDate)
  }

  return formatDateOnly(addMonthsClamped(date, normalizedInterval))
}

export function shouldCreateNextOccurrence(todo: RecurrenceFields, newStatus: TodoStatus): boolean {
  if (newStatus !== 'concluida' || !isRecurringTodo(todo)) return false

  const nextDate = getNextRecurringDate(
    todo.data_prevista,
    todo.recorrencia_tipo,
    todo.recorrencia_intervalo
  )
  if (!nextDate) return false

  return !todo.recorrencia_fim || nextDate <= todo.recorrencia_fim
}

type SaveRecurrenceFields = Pick<
  TodoFormData,
  'status' | 'data_prevista' | 'recorrencia_tipo' | 'recorrencia_intervalo' | 'recorrencia_fim'
>

/** Gera próxima ocorrência ao salvar formulário com status concluída (não ao re-salvar já concluída). */
export function shouldCreateNextOnSave(
  data: SaveRecurrenceFields,
  previousStatus?: TodoStatus | null
): boolean {
  if (data.status !== 'concluida' || previousStatus === 'concluida') return false

  const hasRecorrencia = data.recorrencia_tipo !== 'nenhuma'

  return shouldCreateNextOccurrence(
    {
      data_prevista: data.data_prevista || null,
      recorrencia_tipo: data.recorrencia_tipo,
      recorrencia_intervalo: hasRecorrencia ? data.recorrencia_intervalo : 1,
      recorrencia_fim: hasRecorrencia ? data.recorrencia_fim || null : null,
    },
    'concluida'
  )
}
