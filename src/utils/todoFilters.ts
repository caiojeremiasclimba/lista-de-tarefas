import { TODO_STATUSES, TODO_STATUS_CONFIG } from '../constants/todoStatus'
import { TODO_PRIORIDADES, TODO_PRIORIDADE_CONFIG } from '../constants/todoPrioridade'
import type { FiltroCounts } from '../components/FilterSidebar'
import type { Categoria } from '../types/categoria'
import type { Todo, TodoPrioridade, TodoStatus } from '../types/todo'
import { sortActiveTodos, sortFinalTodos } from './sortTodos'
import { isTodoDueToday, isTodoOverdue } from './todoDue'

export type SecoesAbertas = Record<TodoStatus | 'vencidas' | 'vence_hoje', boolean>

export interface TodoFiltersInput {
  todos: Todo[]
  categorias: Categoria[]
  busca: string
  filtroAtivo: 'todas' | TodoStatus | 'vencidas' | 'vence_hoje'
  filtroCategoria: string | null
  filtroPrioridade: TodoPrioridade | null
}

export interface TodoFiltersResult {
  filtradosPorBusca: Todo[]
  tarefasVisiveis: Todo[]
  porStatus: Record<TodoStatus, Todo[]>
  vencidas: Todo[]
  venceHoje: Todo[]
  counts: FiltroCounts
  countsPorCategoria: Record<string, number>
  countsPorPrioridade: Record<TodoPrioridade, number>
  categoriasPorId: Record<string, string>
  categoriaAtivaNome: string | null
  prioridadeAtivaLabel: string | null
  secoesVisiveis: TodoStatus[]
}

export function getTarefasVisiveis(
  filtroAtivo: TodoFiltersInput['filtroAtivo'],
  filtradosPorBusca: Todo[],
  porStatus: Record<TodoStatus, Todo[]>,
  vencidas: Todo[],
  venceHoje: Todo[]
): Todo[] {
  if (filtroAtivo === 'todas') return filtradosPorBusca
  if (filtroAtivo === 'vencidas') return vencidas
  if (filtroAtivo === 'vence_hoje') return venceHoje
  return porStatus[filtroAtivo]
}

function matchesSearch(todo: Todo, termo: string): boolean {
  return (
    todo.titulo.toLowerCase().includes(termo) ||
    (todo.descricao ?? '').toLowerCase().includes(termo) ||
    (todo.subtarefas?.some((s) => s.titulo.toLowerCase().includes(termo)) ?? false)
  )
}

export function computeTodoFilters(input: TodoFiltersInput): TodoFiltersResult {
  const { todos, categorias, busca, filtroAtivo, filtroCategoria, filtroPrioridade } = input
  const termo = busca.toLowerCase()

  const filtradosParaContadores = todos.filter((t) => matchesSearch(t, termo))

  const filtradosPorCategoria = filtroCategoria
    ? filtradosParaContadores.filter((t) => t.categoria_id === filtroCategoria)
    : filtradosParaContadores

  const filtradosPorPrioridade = filtroPrioridade
    ? filtradosPorCategoria.filter((t) => t.prioridade === filtroPrioridade)
    : filtradosPorCategoria

  const filtradosPorBusca = filtradosPorPrioridade

  const grouped = Object.fromEntries(
    TODO_STATUSES.map((status) => [status, filtradosPorBusca.filter((t) => t.status === status)])
  ) as Record<TodoStatus, Todo[]>

  grouped.pendente = sortActiveTodos(grouped.pendente)
  grouped.em_andamento = sortActiveTodos(grouped.em_andamento)
  grouped.concluida = sortFinalTodos(grouped.concluida)
  grouped.cancelada = sortFinalTodos(grouped.cancelada)

  const vencidas = sortActiveTodos(filtradosPorBusca.filter((t) => isTodoOverdue(t)))
  const venceHoje = sortActiveTodos(filtradosPorBusca.filter((t) => isTodoDueToday(t)))

  const countsPorCategoria = Object.fromEntries(
    categorias.map((c) => [
      c.id,
      filtradosParaContadores.filter((t) => t.categoria_id === c.id).length,
    ])
  )

  const countsPorPrioridade = Object.fromEntries(
    TODO_PRIORIDADES.map((prioridade) => [
      prioridade,
      filtradosPorCategoria.filter((t) => t.prioridade === prioridade).length,
    ])
  ) as Record<TodoPrioridade, number>

  const counts: FiltroCounts = {
    todas: filtradosPorPrioridade.length,
    pendente: filtradosPorPrioridade.filter((t) => t.status === 'pendente').length,
    em_andamento: filtradosPorPrioridade.filter((t) => t.status === 'em_andamento').length,
    concluida: filtradosPorPrioridade.filter((t) => t.status === 'concluida').length,
    cancelada: filtradosPorPrioridade.filter((t) => t.status === 'cancelada').length,
    vencidas: filtradosPorPrioridade.filter((t) => isTodoOverdue(t)).length,
    vence_hoje: filtradosPorPrioridade.filter((t) => isTodoDueToday(t)).length,
  }

  const categoriasPorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]))

  const categoriaAtivaNome = filtroCategoria
    ? (categorias.find((c) => c.id === filtroCategoria)?.nome ?? null)
    : null

  const prioridadeAtivaLabel = filtroPrioridade
    ? TODO_PRIORIDADE_CONFIG[filtroPrioridade].label
    : null

  const secoesVisiveis =
    filtroAtivo === 'todas'
      ? TODO_STATUSES
      : filtroAtivo === 'vencidas' || filtroAtivo === 'vence_hoje'
        ? []
        : [filtroAtivo]

  const tarefasVisiveis = getTarefasVisiveis(
    filtroAtivo,
    filtradosPorBusca,
    grouped,
    vencidas,
    venceHoje
  )

  return {
    filtradosPorBusca,
    tarefasVisiveis,
    porStatus: grouped,
    vencidas,
    venceHoje,
    counts,
    countsPorCategoria,
    countsPorPrioridade,
    categoriasPorId,
    categoriaAtivaNome,
    prioridadeAtivaLabel,
    secoesVisiveis,
  }
}

function getFiltroNome(filtroAtivo: TodoFiltersInput['filtroAtivo']): string | null {
  if (filtroAtivo === 'todas') return null
  if (filtroAtivo === 'vencidas') return 'Vencidas'
  if (filtroAtivo === 'vence_hoje') return 'Vence hoje'
  return TODO_STATUS_CONFIG[filtroAtivo].label
}

function getFiltroVazioFrase(filtroAtivo: TodoFiltersInput['filtroAtivo']): string | null {
  if (filtroAtivo === 'todas') return null
  if (filtroAtivo === 'vencidas') return 'vencida'
  if (filtroAtivo === 'vence_hoje') return 'que vence hoje'
  return TODO_STATUS_CONFIG[filtroAtivo].label.toLowerCase()
}

export function getListaVaziaMensagem(
  buscaTermo: string,
  categoriaAtivaNome: string | null,
  totalTodos: number,
  filtroAtivo: TodoFiltersInput['filtroAtivo'] = 'todas',
  prioridadeAtivaLabel: string | null = null
): string {
  const filtroNome = getFiltroNome(filtroAtivo)
  const filtroFrase = getFiltroVazioFrase(filtroAtivo)

  const prioridadeFrase = prioridadeAtivaLabel
    ? `prioridade ${prioridadeAtivaLabel.toLowerCase()}`
    : null

  if (buscaTermo && categoriaAtivaNome && prioridadeFrase && filtroNome) {
    return `Nenhum resultado para "${buscaTermo}" em ${filtroNome} (${prioridadeFrase}, "${categoriaAtivaNome}")`
  }
  if (buscaTermo && categoriaAtivaNome && prioridadeFrase) {
    return `Nenhum resultado para "${buscaTermo}" em ${prioridadeFrase} ("${categoriaAtivaNome}")`
  }
  if (buscaTermo && prioridadeFrase && filtroNome) {
    return `Nenhum resultado para "${buscaTermo}" em ${filtroNome} (${prioridadeFrase})`
  }
  if (buscaTermo && categoriaAtivaNome && filtroNome) {
    return `Nenhum resultado para "${buscaTermo}" em ${filtroNome} ("${categoriaAtivaNome}")`
  }
  if (buscaTermo && categoriaAtivaNome) {
    return `Nenhum resultado para "${buscaTermo}" em "${categoriaAtivaNome}"`
  }
  if (buscaTermo && prioridadeFrase) {
    return `Nenhum resultado para "${buscaTermo}" em ${prioridadeFrase}`
  }
  if (buscaTermo && filtroNome) {
    return `Nenhum resultado para "${buscaTermo}" em ${filtroNome}`
  }
  if (buscaTermo) {
    return `Nenhum resultado para "${buscaTermo}"`
  }
  if (categoriaAtivaNome && prioridadeFrase && filtroFrase) {
    return `Nenhuma tarefa ${filtroFrase} com ${prioridadeFrase} em "${categoriaAtivaNome}"`
  }
  if (categoriaAtivaNome && prioridadeFrase) {
    return `Nenhuma tarefa com ${prioridadeFrase} em "${categoriaAtivaNome}"`
  }
  if (prioridadeFrase && filtroFrase) {
    return `Nenhuma tarefa ${filtroFrase} com ${prioridadeFrase}`
  }
  if (categoriaAtivaNome && filtroFrase) {
    return `Nenhuma tarefa ${filtroFrase} em "${categoriaAtivaNome}"`
  }
  if (categoriaAtivaNome) {
    return `Nenhuma tarefa em "${categoriaAtivaNome}"`
  }
  if (prioridadeFrase) {
    return `Nenhuma tarefa com ${prioridadeFrase}`
  }
  if (filtroFrase) {
    return `Nenhuma tarefa ${filtroFrase}`
  }
  if (totalTodos === 0) {
    return 'Nenhuma tarefa ainda. Toque em "Nova tarefa" para começar.'
  }
  return 'Nenhuma tarefa encontrada.'
}
