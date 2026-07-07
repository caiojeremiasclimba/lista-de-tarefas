import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export type RealtimeTable = 'categorias' | 'tarefas' | 'subtarefas'

export type RealtimeChangeEvent = {
  table: RealtimeTable
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, unknown> | undefined
  old: Record<string, unknown> | undefined
}

export type RealtimeChangeHandler = (event: RealtimeChangeEvent) => void

interface UseSupabaseRealtimeOptions {
  debounceMs?: number
}

export function useSupabaseRealtime(
  userId: string | undefined,
  tables: readonly RealtimeTable[],
  onChange: RealtimeChangeHandler,
  options?: UseSupabaseRealtimeOptions
) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const debounceMs = options?.debounceMs ?? 0
  const tablesKey = tables.join(',')

  useEffect(() => {
    if (!userId || tables.length === 0) return

    let debounceTimer: ReturnType<typeof setTimeout> | undefined
    let pendingEvent: RealtimeChangeEvent | undefined

    const flushDebounced = () => {
      debounceTimer = undefined
      if (pendingEvent) {
        const event = pendingEvent
        pendingEvent = undefined
        onChangeRef.current(event)
      }
    }

    const scheduleChange = (event: RealtimeChangeEvent) => {
      if (debounceMs <= 0) {
        onChangeRef.current(event)
        return
      }

      pendingEvent = event
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(flushDebounced, debounceMs)
    }

    let channel = supabase.channel(`realtime:${userId}:${tablesKey}`)

    for (const table of tables) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          scheduleChange({
            table,
            eventType: payload.eventType,
            new: payload.new as Record<string, unknown> | undefined,
            old: payload.old as Record<string, unknown> | undefined,
          })
        }
      )
    }

    channel.subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      void supabase.removeChannel(channel)
    }
  }, [userId, tablesKey, tables, debounceMs])
}
