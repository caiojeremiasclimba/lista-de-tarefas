import type { TodoRecorrenciaTipo } from '../types/todo'

export const TODO_RECORRENCIA_TIPOS: TodoRecorrenciaTipo[] = ['diaria', 'semanal', 'mensal']

export const TODO_RECORRENCIA_CONFIG: Record<
  TodoRecorrenciaTipo,
  { label: string; intervalSingular: string; intervalPlural: string }
> = {
  nenhuma: {
    label: 'Nao repetir',
    intervalSingular: 'vez',
    intervalPlural: 'vezes',
  },
  diaria: {
    label: 'Diaria',
    intervalSingular: 'dia',
    intervalPlural: 'dias',
  },
  semanal: {
    label: 'Semanal',
    intervalSingular: 'semana',
    intervalPlural: 'semanas',
  },
  mensal: {
    label: 'Mensal',
    intervalSingular: 'mes',
    intervalPlural: 'meses',
  },
}
