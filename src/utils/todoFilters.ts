import { TODO_STATUSES } from '../constants/todoStatus'
import type { FiltroCounts } from '../components/FilterSidebar'
import type { Categoria } from '../types/categoria'
import type { Todo, TodoStatus } from '../types/todo'
import { sortActiveTodos, sortFinalTodos } from './sortTodos'
import { isTodoOverdue } from './todoDue'

export type SecoesAbertas = Record<TodoStatus | 'vencidas', boolean>

export interface TodoFiltersInput {
  todos: Todo[]
  categorias: Categoria[]
  busca: string
  filtroAtivo: 'todas' | TodoStatus | 'vencidas'
  filtroCategoria: string | null
}

export interface TodoFiltersResult {
  filtradosPorBusca: Todo[]
  porStatus: Record<TodoStatus, Todo[]>
  vencidas: Todo[]
  counts: FiltroCounts
  countsPorCategoria: Record<string, number>
  categoriasPorId: Record<string, string>
  categoriaAtivaNome: string | null
  secoesVisiveis: TodoStatus[]
}

function matchesSearch(todo: Todo, termo: string): boolean {
  return (
    todo.titulo.toLowerCase().includes(termo) ||
    (todo.descricao ?? '').toLowerCase().includes(termo) ||
    (todo.subtarefas?.some((s) => s.titulo.toLowerCase().includes(termo)) ?? false)
  )
}

export function computeTodoFilters(input: TodoFiltersInput): TodoFiltersResult {
  const { todos, categorias, busca, filtroAtivo, filtroCategoria } = input
  const termo = busca.toLowerCase()

  const filtradosParaContadores = todos.filter((t) => matchesSearch(t, termo))

  const filtradosPorCategoria = filtroCategoria
    ? filtradosParaContadores.filter((t) => t.categoria_id === filtroCategoria)
    : filtradosParaContadores

  const filtradosPorBusca = filtradosPorCategoria

  const grouped = Object.fromEntries(
    TODO_STATUSES.map((status) => [
      status,
      filtradosPorBusca.filter((t) => t.status === status),
    ])
  ) as Record<TodoStatus, Todo[]>

  grouped.pendente = sortActiveTodos(grouped.pendente)
  grouped.em_andamento = sortActiveTodos(grouped.em_andamento)
  grouped.concluida = sortFinalTodos(grouped.concluida)
  grouped.cancelada = sortFinalTodos(grouped.cancelada)

  const vencidas = sortActiveTodos(filtradosPorBusca.filter((t) => isTodoOverdue(t)))

  const countsPorCategoria = Object.fromEntries(
    categorias.map((c) => [
      c.id,
      filtradosParaContadores.filter((t) => t.categoria_id === c.id).length,
    ])
  )

  const counts: FiltroCounts = {
    todas: filtradosPorCategoria.length,
    pendente: filtradosPorCategoria.filter((t) => t.status === 'pendente').length,
    em_andamento: filtradosPorCategoria.filter((t) => t.status === 'em_andamento').length,
    concluida: filtradosPorCategoria.filter((t) => t.status === 'concluida').length,
    cancelada: filtradosPorCategoria.filter((t) => t.status === 'cancelada').length,
    vencidas: filtradosPorCategoria.filter((t) => isTodoOverdue(t)).length,
  }

  const categoriasPorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]))

  const categoriaAtivaNome = filtroCategoria
    ? (categorias.find((c) => c.id === filtroCategoria)?.nome ?? null)
    : null

  const secoesVisiveis =
    filtroAtivo === 'todas'
      ? TODO_STATUSES
      : filtroAtivo === 'vencidas'
        ? []
        : [filtroAtivo]

  return {
    filtradosPorBusca,
    porStatus: grouped,
    vencidas,
    counts,
    countsPorCategoria,
    categoriasPorId,
    categoriaAtivaNome,
    secoesVisiveis,
  }
}

export function getListaVaziaMensagem(
  buscaTermo: string,
  categoriaAtivaNome: string | null,
  totalTodos: number
): string {
  if (buscaTermo && categoriaAtivaNome) {
    return `Nenhum resultado para "${buscaTermo}" em "${categoriaAtivaNome}"`
  }
  if (buscaTermo) {
    return `Nenhum resultado para "${buscaTermo}"`
  }
  if (categoriaAtivaNome) {
    return `Nenhuma tarefa em "${categoriaAtivaNome}"`
  }
  if (totalTodos === 0) {
    return 'Nenhuma tarefa ainda. Toque em "Nova tarefa" para começar.'
  }
  return 'Nenhuma tarefa encontrada.'
}
