import type { TodoStatus } from '../types/todo'

export const TODO_STATUSES: TodoStatus[] = ['pendente', 'em_andamento', 'concluida', 'cancelada']

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
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    headerClass: 'text-slate-600 dark:text-slate-300',
  },
  em_andamento: {
    label: 'Em andamento',
    sectionTitle: 'EM ANDAMENTO',
    isFinal: false,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    headerClass: 'text-blue-600 dark:text-blue-400',
  },
  concluida: {
    label: 'Concluída',
    sectionTitle: 'CONCLUÍDAS',
    isFinal: true,
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    headerClass: 'text-green-600 dark:text-green-400',
  },
  cancelada: {
    label: 'Cancelada',
    sectionTitle: 'CANCELADAS',
    isFinal: true,
    badgeClass: 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
    headerClass: 'text-gray-500 dark:text-slate-400',
  },
}

export function isFinalStatus(status: TodoStatus): boolean {
  return TODO_STATUS_CONFIG[status].isFinal
}

/** Next status when the user clicks the quick-toggle control on a task card. */
export function getNextStatusOnToggle(status: TodoStatus): TodoStatus {
  switch (status) {
    case 'pendente':
      return 'em_andamento'
    case 'em_andamento':
      return 'concluida'
    case 'concluida':
      return 'pendente'
    default:
      return status
  }
}
