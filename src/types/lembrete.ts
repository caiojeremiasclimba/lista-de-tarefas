export interface PreferenciasLembrete {
  user_id: string
  horario_local: string
  timezone: string
  updated_at: string
}

export interface PreferenciasLembreteFormData {
  horario_local: string
  timezone: string
}

export type LembreteEnvioTipo = 'no_dia' | 'um_dia_antes' | 'vencida'
