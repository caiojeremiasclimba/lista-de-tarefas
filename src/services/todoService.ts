import { getNextStatusOnToggle } from '../constants/todoStatus'
import { supabase } from '../lib/supabase'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo, TodoFormData } from '../types/todo'
import {
  ATTACHMENT_DB_FIELDS,
  removeAttachment,
  uploadAttachment,
} from '../utils/attachmentStorage'
import {
  fetchTodoWithSubtarefas,
  insertSubtarefas,
  mergeTodoSubtarefas,
  syncSubtarefas,
} from '../utils/subtarefaSync'
import { completedAtForStatusChange } from '../utils/todoCompletedAt'

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*, subtarefas(*)')
    .order('created_at', { ascending: false })
    .order('ordem', { foreignTable: 'subtarefas', ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

async function syncTodoAnexo(
  tarefaId: string,
  userId: string,
  data: TodoFormData,
  existing?: Todo | null
): Promise<void> {
  if (data.removerAnexo && existing?.anexo_path) {
    const anexoPath = existing.anexo_path

    const { error } = await supabase
      .from('tarefas')
      .update(ATTACHMENT_DB_FIELDS)
      .eq('id', tarefaId)

    if (error) throw new Error(error.message)

    try {
      await removeAttachment(anexoPath)
    } catch {
      // Referência já removida no banco; arquivo pode permanecer no Storage.
    }
    return
  }

  if (!data.anexoFile) return

  const metadata = await uploadAttachment(userId, tarefaId, data.anexoFile)

  const { error } = await supabase
    .from('tarefas')
    .update({
      anexo_path: metadata.path,
      anexo_nome: metadata.nome,
      anexo_mime: metadata.mime,
    })
    .eq('id', tarefaId)

  if (error) {
    try {
      await removeAttachment(metadata.path)
    } catch {
      // Upload órfão se o rollback no Storage falhar.
    }
    throw new Error(error.message)
  }

  if (existing?.anexo_path && existing.anexo_path !== metadata.path) {
    try {
      await removeAttachment(existing.anexo_path)
    } catch {
      // Anexo antigo pode permanecer no Storage.
    }
  }
}

function buildTodoPayload(data: TodoFormData, editingTodo?: Todo | null) {
  return {
    titulo: data.titulo.trim(),
    descricao: data.descricao.trim() || null,
    data_prevista: data.data_prevista || null,
    status: data.status,
    categoria_id: data.categoria_id || null,
    completed_at: completedAtForStatusChange(
      data.status,
      editingTodo?.status,
      editingTodo?.completed_at
    ),
  }
}

export async function saveTodo(
  data: TodoFormData,
  editingTodo?: Todo | null
): Promise<Todo> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const payload = buildTodoPayload(data, editingTodo)

  if (editingTodo) {
    const { error: updateError } = await supabase
      .from('tarefas')
      .update(payload)
      .eq('id', editingTodo.id)

    if (updateError) throw new Error(updateError.message)

    await syncSubtarefas(editingTodo.id, user.id, data.subtarefas, editingTodo.subtarefas)
    await syncTodoAnexo(editingTodo.id, user.id, data, editingTodo)
    return fetchTodoWithSubtarefas(editingTodo.id)
  }

  const { data: created, error: insertError } = await supabase
    .from('tarefas')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  const subtarefas = await insertSubtarefas(created.id, user.id, data.subtarefas)

  if (data.anexoFile) {
    await syncTodoAnexo(created.id, user.id, data)
    return fetchTodoWithSubtarefas(created.id)
  }

  return { ...created, subtarefas }
}

export async function deleteTodo(id: string, anexoPath?: string | null): Promise<void> {
  const { error: deleteError } = await supabase.from('tarefas').delete().eq('id', id)

  if (deleteError) throw new Error(deleteError.message)

  if (anexoPath) {
    try {
      await removeAttachment(anexoPath)
    } catch {
      // Tarefa já excluída do banco; arquivo pode permanecer no Storage.
    }
  }
}

export async function toggleTodoStatus(todo: Todo): Promise<Todo> {
  if (todo.status === 'cancelada') {
    throw new Error('Tarefa cancelada não pode mudar de status')
  }

  const newStatus = getNextStatusOnToggle(todo.status)
  const completed_at = completedAtForStatusChange(
    newStatus,
    todo.status,
    todo.completed_at
  )

  const { data: updated, error: updateError } = await supabase
    .from('tarefas')
    .update({ status: newStatus, completed_at })
    .eq('id', todo.id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  return mergeTodoSubtarefas(updated, todo)
}

export async function toggleSubtarefa(sub: Subtarefa): Promise<Subtarefa> {
  const { data: updated, error: updateError } = await supabase
    .from('subtarefas')
    .update({ concluida: !sub.concluida })
    .eq('id', sub.id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  return updated
}
