import type { TodoStatus } from '../types/todo'

export const TODO_STATUSES: TodoStatus[] = [
  'pendente',
  'em_andamento',
  'concluida',
  'cancelada',
]

export interface TodoStatusConfig {
  label: string
  sectionTitle: string
  isFinal: boolean
  badgeClass: string
  headerClass: string
}

export const TODO_STATUS_CONFIG: Record<TodoStatus, TodoStatusConfig> = {
  pendente: {
    label: 'Pendente',
    sectionTitle: 'PENDENTES',
    isFinal: false,
    badgeClass: 'bg-slate-100 text-slate-600',
    headerClass: 'text-slate-600',
  },
  em_andamento: {
    label: 'Em andamento',
    sectionTitle: 'EM ANDAMENTO',
    isFinal: false,
    badgeClass: 'bg-blue-100 text-blue-700',
    headerClass: 'text-blue-600',
  },
  concluida: {
    label: 'Concluída',
    sectionTitle: 'CONCLUÍDAS',
    isFinal: true,
    badgeClass: 'bg-green-100 text-green-700',
    headerClass: 'text-green-600',
  },
  cancelada: {
    label: 'Cancelada',
    sectionTitle: 'CANCELADAS',
    isFinal: true,
    badgeClass: 'bg-gray-100 text-gray-500',
    headerClass: 'text-gray-500',
  },
}

export function isFinalStatus(status: TodoStatus): boolean {
  return TODO_STATUS_CONFIG[status].isFinal
}
