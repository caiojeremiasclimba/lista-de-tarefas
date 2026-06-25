import type { TodoFormData, TodoValidationErrors } from '../types/todo'

export function validateTodo(data: TodoFormData): TodoValidationErrors {
  const erros: TodoValidationErrors = {}

  if (!data.titulo.trim()) {
    erros.titulo = 'O título é obrigatório'
  }

  if (data.data_prevista) {
    const dataObj = new Date(data.data_prevista + 'T00:00:00')
    if (isNaN(dataObj.getTime())) {
      erros.data_prevista = 'Data inválida'
    }
  }

  return erros
}
