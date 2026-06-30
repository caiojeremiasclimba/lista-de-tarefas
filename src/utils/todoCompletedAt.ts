import type { TodoStatus } from '../types/todo'

/** Sets or clears completed_at when status changes. */
export function completedAtForStatusChange(
  newStatus: TodoStatus,
  previousStatus?: TodoStatus,
  existingCompletedAt?: string | null
): string | null {
  if (newStatus !== 'concluida') return null
  if (previousStatus === 'concluida' && existingCompletedAt) {
    return existingCompletedAt
  }
  return new Date().toISOString()
}
