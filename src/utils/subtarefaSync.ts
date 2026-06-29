import type { Subtarefa, SubtarefaDraft } from '../types/subtarefa'
import type { Todo } from '../types/todo'
import { supabase } from '../lib/supabase'

export function mergeTodoSubtarefas(updated: Todo, existing?: Todo): Todo {
  return { ...updated, subtarefas: existing?.subtarefas ?? updated.subtarefas ?? [] }
}

export async function insertSubtarefas(
  tarefaId: string,
  userId: string,
  drafts: SubtarefaDraft[]
): Promise<Subtarefa[]> {
  const valid = drafts.filter((d) => d.titulo.trim())
  if (valid.length === 0) return []

  const { data, error } = await supabase
    .from('subtarefas')
    .insert(
      valid.map((d, i) => ({
        tarefa_id: tarefaId,
        user_id: userId,
        titulo: d.titulo.trim(),
        ordem: i,
      }))
    )
    .select()

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function syncSubtarefas(
  tarefaId: string,
  userId: string,
  drafts: SubtarefaDraft[],
  existing: Subtarefa[] | undefined
): Promise<void> {
  const validDrafts = drafts.filter((d) => d.titulo.trim())
  const existingList = existing ?? []
  const draftIds = new Set(validDrafts.filter((d) => d.id).map((d) => d.id!))

  const toDelete = existingList.filter((s) => !draftIds.has(s.id)).map((s) => s.id)
  if (toDelete.length > 0) {
    const { error } = await supabase.from('subtarefas').delete().in('id', toDelete)
    if (error) throw new Error(error.message)
  }

  for (let index = 0; index < validDrafts.length; index++) {
    const draft = validDrafts[index]
    const titulo = draft.titulo.trim()

    if (draft.id) {
      const original = existingList.find((s) => s.id === draft.id)
      if (!original) continue

      if (original.titulo !== titulo || original.ordem !== index) {
        const { error } = await supabase
          .from('subtarefas')
          .update({ titulo, ordem: index })
          .eq('id', draft.id)
        if (error) throw new Error(error.message)
      }
    } else {
      const { error } = await supabase.from('subtarefas').insert({
        tarefa_id: tarefaId,
        user_id: userId,
        titulo,
        ordem: index,
      })
      if (error) throw new Error(error.message)
    }
  }
}

export async function fetchTodoWithSubtarefas(tarefaId: string) {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*, subtarefas(*)')
    .eq('id', tarefaId)
    .order('ordem', { foreignTable: 'subtarefas', ascending: true })
    .single()

  if (error) throw new Error(error.message)
  return data
}
