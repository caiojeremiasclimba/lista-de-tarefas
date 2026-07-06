import { renderHook } from '@testing-library/react'
import type { FiltroTarefas } from '../components/FilterSidebar'
import type { TodoOrdenacao } from '../constants/todoOrdenacao'
import { makeCategoria, makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import { useTodoFilters } from './useTodoFilters'

const baseOptions = {
  categorias: [makeCategoria({ id: 'cat-1', nome: 'Trabalho' })],
  todos: [
    makeTodo({ id: '1', titulo: 'Tarefa A', categoria_id: 'cat-1' }),
    makeTodo({ id: '2', titulo: 'Tarefa B', status: 'concluida' }),
  ],
  busca: '',
  filtroCategoria: null as string | null,
  filtroPrioridade: null,
  ordenacao: 'inteligente' as TodoOrdenacao,
}

describe('useTodoFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delega filtros para computeTodoFilters', () => {
    const { result } = renderHook(() =>
      useTodoFilters({
        ...baseOptions,
        filtroAtivo: 'todas',
      })
    )

    expect(result.current.counts.todas).toBe(2)
    expect(result.current.tarefasVisiveis).toHaveLength(2)
  })

  it('filtra por busca e expõe mensagem de lista vazia', () => {
    const { result } = renderHook(() =>
      useTodoFilters({
        ...baseOptions,
        busca: 'inexistente',
        filtroAtivo: 'todas',
      })
    )

    expect(result.current.filtradosPorBusca).toHaveLength(0)
    expect(result.current.listaVaziaMensagem).toBe('Nenhum resultado para "inexistente"')
  })

  it('recalcula ao mudar filtroAtivo', () => {
    const { result, rerender } = renderHook(
      ({ filtroAtivo }: { filtroAtivo: FiltroTarefas }) =>
        useTodoFilters({
          ...baseOptions,
          filtroAtivo,
        }),
      { initialProps: { filtroAtivo: 'todas' as FiltroTarefas } }
    )

    expect(result.current.tarefasVisiveis).toHaveLength(2)

    rerender({ filtroAtivo: 'concluida' })

    expect(result.current.tarefasVisiveis).toHaveLength(1)
    expect(result.current.tarefasVisiveis[0].id).toBe('2')
  })
})
