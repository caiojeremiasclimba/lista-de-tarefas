import type { TodoLembreteTipo } from '../types/todo'

export const TODO_LEMBRETE_TIPOS: TodoLembreteTipo[] = ['no_dia', 'um_dia_antes', 'ambos']

export const TODO_LEMBRETE_CONFIG: Record<TodoLembreteTipo, { label: string; shortLabel: string }> =
  {
    no_dia: {
      label: 'No dia',
      shortLabel: 'No dia',
    },
    um_dia_antes: {
      label: '1 dia antes',
      shortLabel: '1 dia antes',
    },
    ambos: {
      label: 'No dia e 1 dia antes',
      shortLabel: 'No dia e antes',
    },
  }

export const DEFAULT_LEMBRETE_HORARIO = '08:00'
export const DEFAULT_LEMBRETE_TIMEZONE = 'America/Sao_Paulo'

export const LEMBRETE_HORARIO_OPCOES = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '12:00',
  '18:00',
] as const
