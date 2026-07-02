import { makeCategoria } from '../test/fixtures/todos'
import {
  AUTH_USER,
  createMockQueryBuilder,
  mockAuthenticatedUser,
  mockFrom,
  mockGetUser,
  mockUnauthenticatedUser,
} from '../test/mocks/supabase'
import {
  createCategoria,
  deleteCategoria,
  fetchCategorias,
  unlinkTodosFromCategoria,
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

    await expect(createCategoria('Nova')).rejects.toThrow('Usuário não autenticado')
  })

  it('cria categoria com user_id do usuário logado', async () => {
    mockAuthenticatedUser()
    const created = makeCategoria({ id: 'cat-new', nome: 'Estudos' })
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await createCategoria('Estudos')

    expect(builder.insert).toHaveBeenCalledWith({ nome: 'Estudos', user_id: AUTH_USER.id })
    expect(result).toEqual(created)
  })

  it('remove espaços extras do nome antes de criar', async () => {
    mockAuthenticatedUser()
    const created = makeCategoria({ id: 'cat-new', nome: 'Estudos' })
    const builder = createMockQueryBuilder({ data: created, error: null })
    mockFrom.mockReturnValue(builder)

    await createCategoria('  Estudos  ')

    expect(builder.insert).toHaveBeenCalledWith({ nome: 'Estudos', user_id: AUTH_USER.id })
  })

  it('lança erro quando nome fica vazio após trim', async () => {
    mockAuthenticatedUser()

    await expect(createCategoria('   ')).rejects.toThrow('Informe o nome da categoria.')
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('updateCategoria', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('atualiza nome e retorna categoria', async () => {
    const updated = makeCategoria({ id: 'cat-1', nome: 'Pessoal' })
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    const result = await updateCategoria('cat-1', 'Pessoal')

    expect(builder.update).toHaveBeenCalledWith({ nome: 'Pessoal' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'cat-1')
    expect(result).toEqual(updated)
  })

  it('remove espaços extras do nome antes de atualizar', async () => {
    const updated = makeCategoria({ id: 'cat-1', nome: 'Pessoal' })
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockFrom.mockReturnValue(builder)

    await updateCategoria('cat-1', '  Pessoal  ')

    expect(builder.update).toHaveBeenCalledWith({ nome: 'Pessoal' })
  })

  it('lança erro quando nome fica vazio após trim', async () => {
    await expect(updateCategoria('cat-1', '   ')).rejects.toThrow('Informe o nome da categoria.')
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('deleteCategoria', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('exclui categoria pelo id', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deleteCategoria('cat-1')

    expect(mockFrom).toHaveBeenCalledWith('categorias')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 'cat-1')
  })
})

describe('unlinkTodosFromCategoria', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('define categoria_id como null nas tarefas vinculadas', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await unlinkTodosFromCategoria('cat-1')

    expect(mockFrom).toHaveBeenCalledWith('tarefas')
    expect(builder.update).toHaveBeenCalledWith({ categoria_id: null })
    expect(builder.eq).toHaveBeenCalledWith('categoria_id', 'cat-1')
  })
})
