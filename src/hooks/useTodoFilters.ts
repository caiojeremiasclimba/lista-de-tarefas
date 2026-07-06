import { useMemo } from 'react'
import type { FiltroTarefas } from '../components/FilterSidebar'
import type { TodoOrdenacao } from '../constants/todoOrdenacao'
import type { Categoria } from '../types/categoria'
import type { Todo, TodoPrioridade } from '../types/todo'
import { computeTodoFilters, getListaVaziaMensagem } from '../utils/todoFilters'

interface UseTodoFiltersOptions {
  todos: Todo[]
  categorias: Categoria[]
  busca: string
  filtroAtivo: FiltroTarefas
  filtroCategoria: string | null
  filtroPrioridade: TodoPrioridade | null
  ordenacao: TodoOrdenacao
}

export function useTodoFilters({
  todos,
  categorias,
  busca,
  filtroAtivo,
  filtroCategoria,
  filtroPrioridade,
  ordenacao,
}: UseTodoFiltersOptions) {
  const filters = useMemo(
    () =>
      computeTodoFilters({
        todos,
        categorias,
        busca,
        filtroAtivo,
        filtroCategoria,
        filtroPrioridade,
        ordenacao,
      }),
    [todos, categorias, busca, filtroAtivo, filtroCategoria, filtroPrioridade, ordenacao]
  )

  const listaVaziaMensagem = useMemo(
    () =>
      getListaVaziaMensagem(
        busca.trim(),
        filters.categoriaAtivaNome,
        todos.length,
        filtroAtivo,
        filters.prioridadeAtivaLabel
      ),
    [busca, filters.categoriaAtivaNome, filters.prioridadeAtivaLabel, todos.length, filtroAtivo]
  )

  return {
    ...filters,
    listaVaziaMensagem,
  }
}
