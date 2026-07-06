import { makeCategoria } from '../test/fixtures/todos'
import {
  AUTH_USER,
  createMockQueryBuilder,
  mockAuthenticatedUser,
  mockFrom,
  mockGetUser,
  mockRpc,
  mockUnauthenticatedUser,
} from '../test/mocks/supabase'
import {
  createCategoria,
  deleteCategoriaComTarefas,
  fetchCategorias,
  updateCategoria,
} from './categoriaService'

describe('fetchCategorias', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('retorna lista de categorias ordenadas', async () => {
    const categorias = [makeCategoria({ id: 'cat-1', nome: 'Trabalho' })]
    const builder = createMockQueryBuilder({ data: categorias, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await fetchCategorias()

    expect(mockFrom).toHaveBeenCalledWith('categorias')
    expect(builder.select).toHaveBeenCalledWith('*')
    expect(builder.order).toHaveBeenCalledWith('nome')
    expect(result).toEqual(categorias)
  })

  it('lança erro quando query falha', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'Erro de rede' } })
    )

    await expect(fetchCategorias()).rejects.toThrow('Erro de rede')
  })
})

describe('createCategoria', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockGetUser.mockReset()
  })

  it('lança erro quando usuário não está autenticado', async () => {
    mockUnauthenticatedUser()

    await expect(createCategoria({ nome: 'Nova', cor: 'slate' })).rejects.toThrow(
      'Usuário não autenticado'
    )
  })

  it('cria categoria com user_id do usuário logado', async () => {
    mockAuthenticatedUser()
    const created = makeCategoria({ id: 'cat-new', nome: 'Estudos', cor: 'blue' })
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await createCategoria({ nome: 'Estudos', cor: 'blue' })

    expect(builder.insert).toHaveBeenCalledWith({
      nome: 'Estudos',
      cor: 'blue',
      user_id: AUTH_USER.id,
    })
    expect(result).toEqual(created)
  })

  it('remove espaços extras do nome antes de criar', async () => {
    mockAuthenticatedUser()
    const created = makeCategoria({ id: 'cat-new', nome: 'Estudos' })
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    await createCategoria({ nome: '  Estudos  ', cor: 'slate' })

    expect(builder.insert).toHaveBeenCalledWith({
      nome: 'Estudos',
      cor: 'slate',
      user_id: AUTH_USER.id,
    })
  })

  it('lança erro quando nome fica vazio após trim', async () => {
    mockAuthenticatedUser()

    await expect(createCategoria({ nome: '   ', cor: 'slate' })).rejects.toThrow(
      'Informe o nome da categoria.'
    )
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('updateCategoria', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('atualiza nome e cor e retorna categoria', async () => {
    const updated = makeCategoria({ id: 'cat-1', nome: 'Pessoal', cor: 'emerald' })
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await updateCategoria('cat-1', { nome: 'Pessoal', cor: 'emerald' })

    expect(builder.update).toHaveBeenCalledWith({ nome: 'Pessoal', cor: 'emerald' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'cat-1')
    expect(result).toEqual(updated)
  })

  it('remove espaços extras do nome antes de atualizar', async () => {
    const updated = makeCategoria({ id: 'cat-1', nome: 'Pessoal' })
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    await updateCategoria('cat-1', { nome: '  Pessoal  ', cor: 'slate' })

    expect(builder.update).toHaveBeenCalledWith({ nome: 'Pessoal', cor: 'slate' })
  })

  it('lança erro quando nome fica vazio após trim', async () => {
    await expect(updateCategoria('cat-1', { nome: '   ', cor: 'slate' })).rejects.toThrow(
      'Informe o nome da categoria.'
    )
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('deleteCategoriaComTarefas', () => {
  beforeEach(() => {
    mockRpc.mockReset()
  })

  it('chama RPC atômica de exclusão', async () => {
    mockRpc.mockResolvedValue({ error: null })

    await deleteCategoriaComTarefas('cat-1')

    expect(mockRpc).toHaveBeenCalledWith('delete_categoria_com_tarefas', {
      p_categoria_id: 'cat-1',
    })
  })

  it('lança erro quando RPC falha', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'Categoria não encontrada' } })

    await expect(deleteCategoriaComTarefas('cat-1')).rejects.toThrow('Categoria não encontrada')
  })
})
