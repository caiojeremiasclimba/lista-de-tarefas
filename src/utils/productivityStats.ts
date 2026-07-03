import { TODO_PRIORIDADES } from '../constants/todoPrioridade'
import { TODO_STATUSES, TODO_STATUS_CONFIG } from '../constants/todoStatus'
import type { Todo, TodoPrioridade, TodoStatus } from '../types/todo'

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEndOfWeek(start: Date): Date {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function isInCurrentWeek(isoDate: string, reference = new Date()): boolean {
  const date = new Date(isoDate)
  const weekStart = getStartOfWeek(reference)
  const weekEnd = getEndOfWeek(weekStart)
  return date >= weekStart && date <= weekEnd
}

export function todosElegiveisParaConclusao(todos: Todo[]): Todo[] {
  return todos.filter((t) => t.status !== 'cancelada')
}

export function calcPercentConcluido(todos: Todo[]): number {
  const elegiveis = todosElegiveisParaConclusao(todos)
  if (elegiveis.length === 0) return 0
  const concluidas = elegiveis.filter((t) => t.status === 'concluida').length
  return Math.round((concluidas / elegiveis.length) * 100)
}

export function calcTotaisPorStatus(todos: Todo[]): Record<TodoStatus, number> {
  return TODO_STATUSES.reduce(
    (acc, status) => {
      acc[status] = todos.filter((t) => t.status === status).length
      return acc
    },
    {} as Record<TodoStatus, number>
  )
}

export function calcTotaisPorPrioridade(todos: Todo[]): Record<TodoPrioridade, number> {
  return TODO_PRIORIDADES.reduce(
    (acc, prioridade) => {
      acc[prioridade] = todos.filter((t) => t.prioridade === prioridade).length
      return acc
    },
    {} as Record<TodoPrioridade, number>
  )
}

export function calcConcluidasNaSemana(todos: Todo[]): number {
  return todos.filter(
    (t) => t.status === 'concluida' && t.completed_at != null && isInCurrentWeek(t.completed_at)
  ).length
}

export interface StatusChartSlice {
  status: TodoStatus
  label: string
  value: number
  color: string
}

const CHART_COLORS: Record<TodoStatus, string> = {
  pendente: '#94a3b8',
  em_andamento: '#2563eb',
  concluida: '#16a34a',
  cancelada: '#9ca3af',
}

export function buildStatusChartData(todos: Todo[]): StatusChartSlice[] {
  const totais = calcTotaisPorStatus(todos)
  return TODO_STATUSES.map((status) => ({
    status,
    label: TODO_STATUS_CONFIG[status].label,
    value: totais[status],
    color: CHART_COLORS[status],
  }))
}
