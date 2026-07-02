import { act, renderHook, waitFor } from '@testing-library/react'
import { makeCategoria } from '../test/fixtures/todos'
import { useCategorias } from './useCategorias'

const { mockFetchCategorias, mockCreateCategoria, mockUpdateCategoria, mockDeleteCategoriaComTarefas } =
  vi.hoisted(() => ({
    mockFetchCategorias: vi.fn(),
    mockCreateCategoria: vi.fn(),
    mockUpdateCategoria: vi.fn(),
    mockDeleteCategoriaComTarefas: vi.fn(),
  }))

vi.mock('../services/categoriaService', () => ({
  fetchCategorias: mockFetchCategorias,
  createCategoria: mockCreateCategoria,
  updateCategoria: mockUpdateCategoria,
  deleteCategoriaComTarefas: mockDeleteCategoriaComTarefas,
}))

describe('useCategorias', () => {
  const unlinkCategoriaFromTodos = vi.fn()
  const setFiltroCategoria = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCategorias.mockResolvedValue([makeCategoria({ id: 'cat-1', nome: 'Trabalho' })])
    mockDeleteCategoriaComTarefas.mockResolvedValue(undefined)
  })

  function renderUseCategorias(overrides: Partial<Parameters<typeof useCategorias>[0]> = {}) {
    return renderHook(() =>
      useCategorias({
        unlinkCategoriaFromTodos,
        filtroCategoria: null,
        setFiltroCategoria,
        ...overrides,
      })
    )
  }

  it('carrega categorias ao montar', async () => {
    const { result } = renderUseCategorias()

    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    expect(mockFetchCategorias).toHaveBeenCalled()
    expect(result.current.categorias[0].nome).toBe('Trabalho')
  })

  it('cria categoria e ativa filtro', async () => {
    const created = makeCategoria({ id: 'cat-new', nome: 'Estudos' })
    mockCreateCategoria.mockResolvedValue(created)

    const { result } = renderUseCategorias()
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.handleCreateCategoria('Estudos')
    })

    expect(setFiltroCategoria).toHaveBeenCalledWith('cat-new')
    expect(result.current.categorias.map((c) => c.nome)).toContain('Estudos')
  })

  it('atualiza categoria existente', async () => {
    const updated = makeCategoria({ id: 'cat-1', nome: 'Pessoal' })
    mockUpdateCategoria.mockResolvedValue(updated)

    const { result } = renderUseCategorias()
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.handleUpdateCategoria('cat-1', 'Pessoal')
    })

    expect(result.current.categorias[0].nome).toBe('Pessoal')
  })

  it('exclui categoria via RPC atômica', async () => {
    const { result } = renderUseCategorias()
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.executeDeleteCategoria('cat-1')
    })

    expect(mockDeleteCategoriaComTarefas).toHaveBeenCalledWith('cat-1')
    expect(result.current.categorias).toHaveLength(0)
    expect(unlinkCategoriaFromTodos).toHaveBeenCalledWith('cat-1')
  })
})
