import type { TodoFormData, TodoValidationErrors } from '../types/todo'

export function validateTodo(data: TodoFormData): TodoValidationErrors {
  const erros: TodoValidationErrors = {}
  const hasRecorrencia = data.recorrencia_tipo !== 'nenhuma'

  if (!data.titulo.trim()) {
    erros.titulo = 'O título é obrigatório'
  }

  if (hasRecorrencia && !data.data_prevista) {
    erros.data_prevista = 'Informe a data prevista para repetir a tarefa'
  } else if (data.lembrete_email && !data.data_prevista) {
    erros.data_prevista = 'Informe a data prevista para receber lembrete por e-mail'
  } else if (data.data_prevista) {
    const dataObj = new Date(data.data_prevista + 'T00:00:00')
    if (isNaN(dataObj.getTime())) erros.data_prevista = 'Data inválida'
  }

  if (
    hasRecorrencia &&
    (!Number.isFinite(data.recorrencia_intervalo) || data.recorrencia_intervalo < 1)
  ) {
    erros.recorrencia_intervalo = 'Intervalo deve ser maior ou igual a 1'
  }

  if (hasRecorrencia && data.recorrencia_fim) {
    const fimObj = new Date(data.recorrencia_fim + 'T00:00:00')
    if (isNaN(fimObj.getTime())) {
      erros.recorrencia_fim = 'Data final inválida'
    } else if (data.data_prevista && data.recorrencia_fim < data.data_prevista) {
      erros.recorrencia_fim = 'Data final deve ser posterior à data prevista'
    }
  }

  return erros
}
