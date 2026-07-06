import { supabase } from '../lib/supabase'
import { DEFAULT_LEMBRETE_HORARIO, DEFAULT_LEMBRETE_TIMEZONE } from '../constants/todoLembrete'
import type { PreferenciasLembrete, PreferenciasLembreteFormData } from '../types/lembrete'

export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_LEMBRETE_TIMEZONE
  } catch {
    return DEFAULT_LEMBRETE_TIMEZONE
  }
}

export function buildDefaultPreferencias(userId: string): PreferenciasLembrete {
  return {
    user_id: userId,
    horario_local: DEFAULT_LEMBRETE_HORARIO,
    timezone: getDefaultTimezone(),
    updated_at: new Date().toISOString(),
  }
}

export async function fetchPreferenciasLembrete(userId: string): Promise<PreferenciasLembrete> {
  const { data, error } = await supabase
    .from('preferencias_lembrete')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (data) return data as PreferenciasLembrete

  return buildDefaultPreferencias(userId)
}

export async function savePreferenciasLembrete(
  userId: string,
  form: PreferenciasLembreteFormData
): Promise<PreferenciasLembrete> {
  const payload = {
    user_id: userId,
    horario_local: form.horario_local,
    timezone: form.timezone,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('preferencias_lembrete')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Não foi possível salvar as preferências de lembrete.')

  return data as PreferenciasLembrete
}
