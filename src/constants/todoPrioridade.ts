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
    badgeClass: 'bg-red-100 text-red-700',
    sortOrder: 0,
  },
  media: {
    label: 'Média',
    badgeClass: 'bg-amber-100 text-amber-800',
    sortOrder: 1,
  },
  baixa: {
    label: 'Baixa',
    badgeClass: 'bg-slate-100 text-slate-600',
    sortOrder: 2,
  },
}
