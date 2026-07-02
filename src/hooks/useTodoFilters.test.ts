import { renderHook } from '@testing-library/react'
import type { FiltroTarefas } from '../components/FilterSidebar'
import { makeCategoria, makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import { useTodoFilters } from './useTodoFilters'

describe('useTodoFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const categorias = [makeCategoria({ id: 'cat-1', nome: 'Trabalho' })]
  const todos = [
    makeTodo({ id: '1', titulo: 'Tarefa A', categoria_id: 'cat-1' }),
    makeTodo({ id: '2', titulo: 'Tarefa B', status: 'concluida' }),
  ]

  it('delega filtros para computeTodoFilters', () => {
    const { result } = renderHook(() =>
      useTodoFilters({
        todos,
        categorias,
        busca: '',
        filtroAtivo: 'todas',
        filtroCategoria: null,
      })
    )

    expect(result.current.counts.todas).toBe(2)
    expect(result.current.tarefasVisiveis).toHaveLength(2)
  })

  it('filtra por busca e expõe mensagem de lista vazia', () => {
    const { result } = renderHook(() =>
      useTodoFilters({
        todos,
        categorias,
        busca: 'inexistente',
        filtroAtivo: 'todas',
        filtroCategoria: null,
      })
    )

    expect(result.current.filtradosPorBusca).toHaveLength(0)
    expect(result.current.listaVaziaMensagem).toBe(
      'Nenhum resultado para "inexistente"'
    )
  })

  it('recalcula ao mudar filtroAtivo', () => {
    const { result, rerender } = renderHook(
      ({ filtroAtivo }: { filtroAtivo: FiltroTarefas }) =>
        useTodoFilters({
          todos,
          categorias,
          busca: '',
          filtroAtivo,
          filtroCategoria: null,
        }),
      { initialProps: { filtroAtivo: 'todas' as FiltroTarefas } }
    )

    expect(result.current.tarefasVisiveis).toHaveLength(2)

    rerender({ filtroAtivo: 'concluida' })

    expect(result.current.tarefasVisiveis).toHaveLength(1)
    expect(result.current.tarefasVisiveis[0].id).toBe('2')
  })
})
