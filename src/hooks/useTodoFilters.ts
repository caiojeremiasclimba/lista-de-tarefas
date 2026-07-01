import { useMemo } from 'react'
import type { FiltroTarefas } from '../components/FilterSidebar'
import type { Categoria } from '../types/categoria'
import type { Todo } from '../types/todo'
import { computeTodoFilters, getListaVaziaMensagem } from '../utils/todoFilters'

interface UseTodoFiltersOptions {
  todos: Todo[]
  categorias: Categoria[]
  busca: string
  filtroAtivo: FiltroTarefas
  filtroCategoria: string | null
}

export function useTodoFilters({
  todos,
  categorias,
  busca,
  filtroAtivo,
  filtroCategoria,
}: UseTodoFiltersOptions) {
  const filters = useMemo(
    () =>
      computeTodoFilters({
        todos,
        categorias,
        busca,
        filtroAtivo,
        filtroCategoria,
      }),
    [todos, categorias, busca, filtroAtivo, filtroCategoria]
  )

  const listaVaziaMensagem = useMemo(
    () => getListaVaziaMensagem(busca.trim(), filters.categoriaAtivaNome, todos.length),
    [busca, filters.categoriaAtivaNome, todos.length]
  )

  return {
    ...filters,
    listaVaziaMensagem,
  }
}
