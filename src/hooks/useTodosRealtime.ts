import type { Dispatch, SetStateAction } from 'react'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo } from '../types/todo'
import {
  applySubtarefaChange,
  applyTarefaDelete,
  applyTarefaUpsert,
} from '../utils/realtimeTodoMerge'
import { fetchTodoWithSubtarefas } from '../utils/subtarefaSync'
import type { RealtimeChangeEvent } from './useSupabaseRealtime'

const FULL_RELOAD_DEBOUNCE_MS = 300

function asTodo(row: Record<string, unknown> | undefined): Todo | null {
  if (!row || typeof row.id !== 'string') return null
  return row as unknown as Todo
}

function asSubtarefa(row: Record<string, unknown> | undefined): Subtarefa | null {
  if (!row || typeof row.id !== 'string' || typeof row.tarefa_id !== 'string') return null
  return row as unknown as Subtarefa
}

export function createTodosRealtimeHandler(options: {
  setTodos: Dispatch<SetStateAction<Todo[]>>
  loadTodos: () => Promise<void>
}): (event: RealtimeChangeEvent) => void {
  let reloadTimer: ReturnType<typeof setTimeout> | undefined

  const scheduleFullReload = () => {
    if (reloadTimer) clearTimeout(reloadTimer)
    reloadTimer = setTimeout(() => {
      reloadTimer = undefined
      void options.loadTodos()
    }, FULL_RELOAD_DEBOUNCE_MS)
  }

  return (event) => {
    void handleTodosRealtimeEvent(event, options.setTodos, scheduleFullReload)
  }
}

async function handleTodosRealtimeEvent(
  event: RealtimeChangeEvent,
  setTodos: Dispatch<SetStateAction<Todo[]>>,
  scheduleFullReload: () => void
): Promise<void> {
  if (event.table === 'tarefas') {
    if (event.eventType === 'DELETE') {
      const id = event.old?.id
      if (typeof id !== 'string') {
        scheduleFullReload()
        return
      }
      setTodos((prev) => applyTarefaDelete(prev, id))
      return
    }

    const row = asTodo(event.new)
    if (!row) {
      scheduleFullReload()
      return
    }

    try {
      const todo = row.subtarefas !== undefined ? row : await fetchTodoWithSubtarefas(row.id)
      setTodos((prev) => applyTarefaUpsert(prev, todo))
    } catch {
      scheduleFullReload()
    }
    return
  }

  if (event.table === 'subtarefas') {
    if (event.eventType === 'DELETE') {
      const sub = asSubtarefa(event.old)
      if (!sub) {
        scheduleFullReload()
        return
      }
      setTodos((prev) => applySubtarefaChange(prev, sub, 'DELETE'))
      return
    }

    const sub = asSubtarefa(event.new)
    if (!sub) {
      scheduleFullReload()
      return
    }

    setTodos((prev) => applySubtarefaChange(prev, sub, event.eventType))
    return
  }

  scheduleFullReload()
}
