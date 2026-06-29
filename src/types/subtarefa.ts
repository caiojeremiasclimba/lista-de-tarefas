export interface Subtarefa {
  id: string
  tarefa_id: string
  user_id: string
  titulo: string
  concluida: boolean
  ordem: number
  created_at: string
}

export interface SubtarefaDraft {
  id?: string
  titulo: string
  concluida?: boolean
}
