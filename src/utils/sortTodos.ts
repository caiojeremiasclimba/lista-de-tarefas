import type { Todo } from '../types/todo'
import { isTodoOverdue } from './todoDue'

function compareByDueDate(a: Todo, b: Todo): number {
  if (!a.data_prevista && !b.data_prevista) return 0
  if (!a.data_prevista) return 1
  if (!b.data_prevista) return -1
  return a.data_prevista.localeCompare(b.data_prevista)
}

export function sortActiveTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const aOverdue = isTodoOverdue(a)
    const bOverdue = isTodoOverdue(b)
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    return compareByDueDate(a, b)
  })
}

export function sortFinalTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => b.created_at.localeCompare(a.created_at))
}
