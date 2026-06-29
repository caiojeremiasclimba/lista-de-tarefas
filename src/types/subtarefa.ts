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
  /** Stable client-side key for React lists; equals `id` when loaded from the server. */
  clientKey: string
  id?: string
  titulo: string
  concluida: boolean
}

export function createSubtarefaDraft(partial: Partial<SubtarefaDraft> = {}): SubtarefaDraft {
  const id = partial.id
  return {
    titulo: partial.titulo ?? '',
    concluida: partial.concluida ?? false,
    id,
    clientKey: partial.clientKey ?? id ?? crypto.randomUUID(),
  }
}

export function getSubtarefaDraftKey(draft: SubtarefaDraft): string {
  return draft.id ?? draft.clientKey
}
