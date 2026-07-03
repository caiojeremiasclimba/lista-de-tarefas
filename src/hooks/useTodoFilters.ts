import { useMemo } from 'react'
import type { FiltroTarefas } from '../components/FilterSidebar'
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
}

export function useTodoFilters({
  todos,
  categorias,
  busca,
  filtroAtivo,
  filtroCategoria,
  filtroPrioridade,
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
      }),
    [todos, categorias, busca, filtroAtivo, filtroCategoria, filtroPrioridade]
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
