export type TodoStatus = 'pendente' | 'concluida'

export interface Todo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  data_prevista: string | null
  status: TodoStatus
  created_at: string
}

export interface TodoFormData {
  titulo: string
  descricao: string
  data_prevista: string
  status: TodoStatus
}

export interface TodoValidationErrors {
  titulo?: string
  data_prevista?: string
}
