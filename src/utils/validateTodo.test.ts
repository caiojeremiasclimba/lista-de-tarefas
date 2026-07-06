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

  it('exige data prevista quando lembrete por e-mail está ativo', () => {
    const erros = validateTodo(
      makeTodoFormData({
        titulo: 'Tarefa',
        lembrete_email: true,
        data_prevista: '',
      })
    )

    expect(erros.data_prevista).toBe('Informe a data prevista para receber lembrete por e-mail')
  })

  it('não valida data quando data_prevista está vazia', () => {
    const erros = validateTodo(makeTodoFormData({ titulo: 'Tarefa sem data', data_prevista: '' }))

    expect(erros.data_prevista).toBeUndefined()
    expect(erros.titulo).toBeUndefined()
  })

  it('exige data prevista para tarefa recorrente', () => {
    const erros = validateTodo(
      makeTodoFormData({
        data_prevista: '',
        recorrencia_tipo: 'semanal',
      })
    )

    expect(erros.data_prevista).toBe('Informe a data prevista para repetir a tarefa')
  })

  it('valida intervalo de recorrência', () => {
    const erros = validateTodo(
      makeTodoFormData({
        data_prevista: '2026-07-10',
        recorrencia_tipo: 'semanal',
        recorrencia_intervalo: 0,
      })
    )

    expect(erros.recorrencia_intervalo).toBe('Intervalo deve ser maior ou igual a 1')
  })

  it('valida data final de recorrência anterior à data prevista', () => {
    const erros = validateTodo(
      makeTodoFormData({
        data_prevista: '2026-07-10',
        recorrencia_tipo: 'mensal',
        recorrencia_fim: '2026-07-01',
      })
    )

    expect(erros.recorrencia_fim).toBe('Data final deve ser posterior à data prevista')
  })
})
