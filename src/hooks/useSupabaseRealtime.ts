import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export type RealtimeTable = 'categorias' | 'tarefas' | 'subtarefas'

export function useSupabaseRealtime(
  userId: string | undefined,
  tables: readonly RealtimeTable[],
  onChange: () => void
) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const tablesKey = tables.join(',')

  useEffect(() => {
    if (!userId || tables.length === 0) return

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
        () => {
          onChangeRef.current()
        }
      )
    }

    channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, tablesKey, tables])
}
