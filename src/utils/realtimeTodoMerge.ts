import type { Subtarefa } from '../types/subtarefa'
import type { Todo } from '../types/todo'

export function applyTarefaDelete(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id)
}

export function applyTarefaUpsert(todos: Todo[], todo: Todo): Todo[] {
  const exists = todos.some((t) => t.id === todo.id)
  if (!exists) return [todo, ...todos]
  return todos.map((t) => (t.id === todo.id ? todo : t))
}

export function applySubtarefaChange(
  todos: Todo[],
  sub: Subtarefa,
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== sub.tarefa_id) return todo

    const subtarefas = todo.subtarefas ?? []

    if (eventType === 'DELETE') {
      return { ...todo, subtarefas: subtarefas.filter((s) => s.id !== sub.id) }
    }

    const exists = subtarefas.some((s) => s.id === sub.id)
    if (!exists) {
      return { ...todo, subtarefas: [...subtarefas, sub] }
    }

    return {
      ...todo,
      subtarefas: subtarefas.map((s) => (s.id === sub.id ? sub : s)),
    }
  })
}
