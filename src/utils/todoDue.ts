import { isFinalStatus } from '../constants/todoStatus'
import type { Todo } from '../types/todo'
import { toDateOnly } from './formatTodoDate'

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isTodoOverdue(todo: Todo): boolean {
  if (!todo.data_prevista) return false
  if (isFinalStatus(todo.status)) return false

  const due = toDateOnly(todo.data_prevista)
  due.setHours(0, 0, 0, 0)

  return due < startOfToday()
}

export function isTodoDueToday(todo: Todo): boolean {
  if (!todo.data_prevista) return false
  if (isFinalStatus(todo.status)) return false
  if (isTodoOverdue(todo)) return false

  const due = toDateOnly(todo.data_prevista)
  due.setHours(0, 0, 0, 0)

  return due.getTime() === startOfToday().getTime()
}
