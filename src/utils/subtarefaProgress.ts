import type { Subtarefa } from '../types/subtarefa'

export function getSubtarefaProgress(subtarefas?: Subtarefa[]) {
  const lista = subtarefas ?? []
  return {
    concluidas: lista.filter((s) => s.concluida).length,
    total: lista.length,
  }
}
