import type { Subtarefa, SubtarefaDraft } from './subtarefa'

export type TodoStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'

export interface Todo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  data_prevista: string | null
  status: TodoStatus
  categoria_id: string | null
  created_at: string
  completed_at: string | null
  subtarefas?: Subtarefa[]
}

export interface TodoFormData {
  titulo: string
  descricao: string
  data_prevista: string
  status: TodoStatus
  categoria_id: string
  subtarefas: SubtarefaDraft[]
}

export interface TodoValidationErrors {
  titulo?: string
  data_prevista?: string
}
