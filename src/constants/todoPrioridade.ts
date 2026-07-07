import type { TodoPrioridade } from '../types/todo'

export const TODO_PRIORIDADES: TodoPrioridade[] = ['alta', 'media', 'baixa']

export interface TodoPrioridadeConfig {
  label: string
  badgeClass: string
  sortOrder: number
}

export const TODO_PRIORIDADE_CONFIG: Record<TodoPrioridade, TodoPrioridadeConfig> = {
  alta: {
    label: 'Alta',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    sortOrder: 0,
  },
  media: {
    label: 'Média',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    sortOrder: 1,
  },
  baixa: {
    label: 'Baixa',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    sortOrder: 2,
  },
}
