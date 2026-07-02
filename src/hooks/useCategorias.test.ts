import { act, renderHook, waitFor } from '@testing-library/react'
import { makeCategoria, makeTodo } from '../test/fixtures/todos'
import { useCategorias } from './useCategorias'

const {
  mockFetchCategorias,
  mockCreateCategoria,
  mockUpdateCategoria,
  mockDeleteCategoria,
  mockUnlinkTodosFromCategoria,
} = vi.hoisted(() => ({
  mockFetchCategorias: vi.fn(),
  mockCreateCategoria: vi.fn(),
  mockUpdateCategoria: vi.fn(),
  mockDeleteCategoria: vi.fn(),
  mockUnlinkTodosFromCategoria: vi.fn(),
}))

vi.mock('../services/categoriaService', () => ({
  fetchCategorias: mockFetchCategorias,
  createCategoria: mockCreateCategoria,
  updateCategoria: mockUpdateCategoria,
  deleteCategoria: mockDeleteCategoria,
  unlinkTodosFromCategoria: mockUnlinkTodosFromCategoria,
}))

describe('useCategorias', () => {
  const onError = vi.fn()
  const unlinkCategoriaFromTodos = vi.fn()
  const setFiltroCategoria = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCategorias.mockResolvedValue([makeCategoria({ id: 'cat-1', nome: 'Trabalho' })])
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function renderUseCategorias(overrides: Partial<Parameters<typeof useCategorias>[0]> = {}) {
    return renderHook(() =>
      useCategorias({
        todos: [],
        onError,
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

  it('exclui categoria após confirmação', async () => {
    const { result } = renderUseCategorias()
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.handleDeleteCategoria('cat-1')
    })

    expect(mockDeleteCategoria).toHaveBeenCalledWith('cat-1')
    expect(result.current.categorias).toHaveLength(0)
    expect(unlinkCategoriaFromTodos).toHaveBeenCalledWith('cat-1')
  })

  it('não exclui quando usuário cancela confirmação', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false))

    const { result } = renderUseCategorias()
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.handleDeleteCategoria('cat-1')
    })

    expect(mockDeleteCategoria).not.toHaveBeenCalled()
    expect(result.current.categorias).toHaveLength(1)
  })

  it('desvincula tarefas no backend quando categoria tem tarefas', async () => {
    const todos = [makeTodo({ categoria_id: 'cat-1' })]

    const { result } = renderUseCategorias({ todos })
    await waitFor(() => expect(result.current.categorias).toHaveLength(1))

    await act(async () => {
      await result.current.handleDeleteCategoria('cat-1')
    })

    expect(mockUnlinkTodosFromCategoria).toHaveBeenCalledWith('cat-1')
  })
})
