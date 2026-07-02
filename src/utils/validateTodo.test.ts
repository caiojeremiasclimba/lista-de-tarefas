import { makeTodoFormData } from '../test/fixtures/todos'
import { validateTodo } from './validateTodo'

/**
 * Testa validateTodo — validação do formulário de nova/editar tarefa.
 * Variáveis: titulo (obrigatório, trim) e data_prevista (opcional, formato válido).
 */
describe('validateTodo', () => {
  it('retorna erro quando título está vazio', () => {
    const erros = validateTodo(makeTodoFormData({ titulo: '' }))

    expect(erros.titulo).toBe('O título é obrigatório')
  })

  it('retorna erro quando título é só espaços', () => {
    const erros = validateTodo(makeTodoFormData({ titulo: '   ' }))

    expect(erros.titulo).toBe('O título é obrigatório')
  })

  it('retorna erro quando data_prevista é inválida', () => {
    const erros = validateTodo(makeTodoFormData({ data_prevista: 'data-invalida' }))

    expect(erros.data_prevista).toBe('Data inválida')
  })

  it('retorna objeto vazio quando dados são válidos', () => {
    const erros = validateTodo(
      makeTodoFormData({ titulo: 'Comprar leite', data_prevista: '2026-07-10' })
    )

    expect(erros).toEqual({})
  })

  it('não valida data quando data_prevista está vazia', () => {
    const erros = validateTodo(makeTodoFormData({ titulo: 'Tarefa sem data', data_prevista: '' }))

    expect(erros.data_prevista).toBeUndefined()
    expect(erros.titulo).toBeUndefined()
  })
})
