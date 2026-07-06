import { type TodoOrdenacao, DEFAULT_TODO_ORDENACAO } from '../constants/todoOrdenacao'
import { TODO_PRIORIDADE_CONFIG } from '../constants/todoPrioridade'
import type { Todo } from '../types/todo'
import { isTodoOverdue } from './todoDue'

export type SortTodosVariant = 'active' | 'final'

function compareByCreatedAtDesc(a: Todo, b: Todo): number {
  return b.created_at.localeCompare(a.created_at)
}

function compareByCreatedAtAsc(a: Todo, b: Todo): number {
  return a.created_at.localeCompare(b.created_at)
}

function compareByDueDate(a: Todo, b: Todo): number {
  if (!a.data_prevista && !b.data_prevista) return 0
  if (!a.data_prevista) return 1
  if (!b.data_prevista) return -1
  return a.data_prevista.localeCompare(b.data_prevista)
}

function compareByPrioridade(a: Todo, b: Todo): number {
  return (
    TODO_PRIORIDADE_CONFIG[a.prioridade].sortOrder - TODO_PRIORIDADE_CONFIG[b.prioridade].sortOrder
  )
}

function compareByTitulo(a: Todo, b: Todo): number {
  return a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' })
}

function compareByCompletedAtDesc(a: Todo, b: Todo): number {
  const aDate = a.completed_at ?? a.created_at
  const bDate = b.completed_at ?? b.created_at
  return bDate.localeCompare(aDate)
}

function compareInteligente(a: Todo, b: Todo): number {
  const aOverdue = isTodoOverdue(a)
  const bOverdue = isTodoOverdue(b)
  if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
  const byDue = compareByDueDate(a, b)
  if (byDue !== 0) return byDue
  const byPriority = compareByPrioridade(a, b)
  if (byPriority !== 0) return byPriority
  return compareByCreatedAtAsc(a, b)
}

function compareByPrioridadeThenDue(a: Todo, b: Todo): number {
  const byPriority = compareByPrioridade(a, b)
  if (byPriority !== 0) return byPriority
  const byDue = compareByDueDate(a, b)
  if (byDue !== 0) return byDue
  return compareByCreatedAtAsc(a, b)
}

function getActiveComparator(ordenacao: TodoOrdenacao): (a: Todo, b: Todo) => number {
  switch (ordenacao) {
    case 'inteligente':
      return compareInteligente
    case 'data_prevista':
      return (a, b) => {
        const byDue = compareByDueDate(a, b)
        if (byDue !== 0) return byDue
        return compareByPrioridade(a, b)
      }
    case 'prioridade':
      return compareByPrioridadeThenDue
    case 'recentes':
      return (a, b) => {
        const byCreated = compareByCreatedAtDesc(a, b)
        if (byCreated !== 0) return byCreated
        return compareByTitulo(a, b)
      }
    case 'titulo':
      return (a, b) => {
        const byTitle = compareByTitulo(a, b)
        if (byTitle !== 0) return byTitle
        return compareByCreatedAtAsc(a, b)
      }
  }
}

function getFinalComparator(ordenacao: TodoOrdenacao): (a: Todo, b: Todo) => number {
  if (ordenacao === 'recentes' || ordenacao === 'inteligente') {
    return (a, b) => {
      const byCompleted = compareByCompletedAtDesc(a, b)
      if (byCompleted !== 0) return byCompleted
      return compareByCreatedAtDesc(a, b)
    }
  }
  return getActiveComparator(ordenacao)
}

export function sortTodos(
  todos: Todo[],
  ordenacao: TodoOrdenacao = DEFAULT_TODO_ORDENACAO,
  variant: SortTodosVariant = 'active'
): Todo[] {
  const compare =
    variant === 'final' ? getFinalComparator(ordenacao) : getActiveComparator(ordenacao)
  return [...todos].sort(compare)
}

export function sortActiveTodos(todos: Todo[]): Todo[] {
  return sortTodos(todos, 'inteligente', 'active')
}

export function sortFinalTodos(todos: Todo[]): Todo[] {
  return sortTodos(todos, 'inteligente', 'final')
}
