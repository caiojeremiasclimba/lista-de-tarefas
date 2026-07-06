import { getNextStatusOnToggle } from '../constants/todoStatus'
import { supabase } from '../lib/supabase'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo, TodoFormData, TodoStatus } from '../types/todo'
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
import {
  getNextRecurringDate,
  getRecurrenceSeriesRootId,
  shouldCreateNextOccurrence,
  shouldCreateNextOnSave,
} from '../utils/todoRecurrence'

export interface ToggleTodoStatusResult {
  updatedTodo: Todo
  createdNextTodo: Todo | null
}

export interface SaveTodoResult {
  savedTodo: Todo
  createdNextTodo: Todo | null
}

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

    const { error } = await supabase.from('tarefas').update(ATTACHMENT_DB_FIELDS).eq('id', tarefaId)

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
  const hasRecorrencia = data.recorrencia_tipo !== 'nenhuma'

  return {
    titulo: data.titulo.trim(),
    descricao: data.descricao.trim() || null,
    data_prevista: data.data_prevista || null,
    status: data.status,
    prioridade: data.prioridade,
    categoria_id: data.categoria_id || null,
    recorrencia_tipo: data.recorrencia_tipo,
    recorrencia_intervalo: hasRecorrencia ? data.recorrencia_intervalo : 1,
    recorrencia_fim: hasRecorrencia ? data.recorrencia_fim || null : null,
    lembrete_email: Boolean(data.data_prevista && data.lembrete_email),
    lembrete_tipo: data.lembrete_tipo,
    completed_at: completedAtForStatusChange(
      data.status,
      editingTodo?.status,
      editingTodo?.completed_at
    ),
  }
}

async function rollbackCreatedTodo(id: string): Promise<void> {
  const { error } = await supabase.from('tarefas').delete().eq('id', id)
  if (error) {
    throw new Error(
      `Não foi possível concluir o salvamento e a tarefa parcial pode ter ficado no banco. Recarregue a lista. (${error.message})`
    )
  }
}

async function restoreSubtarefas(
  tarefaId: string,
  userId: string,
  original: Subtarefa[]
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('subtarefas')
    .select('*')
    .eq('tarefa_id', tarefaId)

  if (fetchError) throw new Error(fetchError.message)

  const currentList = current ?? []
  const originalIds = new Set(original.map((s) => s.id))

  const toDelete = currentList.filter((s) => !originalIds.has(s.id)).map((s) => s.id)
  if (toDelete.length > 0) {
    const { error } = await supabase.from('subtarefas').delete().in('id', toDelete)
    if (error) throw new Error(error.message)
  }

  for (const sub of original) {
    const existing = currentList.find((s) => s.id === sub.id)

    if (existing) {
      const updates: { titulo?: string; ordem?: number; concluida?: boolean } = {}
      if (existing.titulo !== sub.titulo) updates.titulo = sub.titulo
      if (existing.ordem !== sub.ordem) updates.ordem = sub.ordem
      if (existing.concluida !== sub.concluida) updates.concluida = sub.concluida

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('subtarefas').update(updates).eq('id', sub.id)
        if (error) throw new Error(error.message)
      }
    } else {
      const { error } = await supabase.from('subtarefas').insert({
        id: sub.id,
        tarefa_id: tarefaId,
        user_id: userId,
        titulo: sub.titulo,
        ordem: sub.ordem,
        concluida: sub.concluida,
      })
      if (error) throw new Error(error.message)
    }
  }
}

async function rollbackEditedTodo(editingTodo: Todo, userId: string): Promise<void> {
  const { error: updateError } = await supabase
    .from('tarefas')
    .update({
      titulo: editingTodo.titulo,
      descricao: editingTodo.descricao,
      data_prevista: editingTodo.data_prevista,
      status: editingTodo.status,
      prioridade: editingTodo.prioridade,
      categoria_id: editingTodo.categoria_id,
      completed_at: editingTodo.completed_at,
      anexo_path: editingTodo.anexo_path ?? null,
      anexo_nome: editingTodo.anexo_nome ?? null,
      anexo_mime: editingTodo.anexo_mime ?? null,
      recorrencia_tipo: editingTodo.recorrencia_tipo,
      recorrencia_intervalo: editingTodo.recorrencia_intervalo,
      recorrencia_fim: editingTodo.recorrencia_fim,
      recorrencia_origem_id: editingTodo.recorrencia_origem_id,
      lembrete_email: editingTodo.lembrete_email,
      lembrete_tipo: editingTodo.lembrete_tipo,
    })
    .eq('id', editingTodo.id)

  if (updateError) {
    throw new Error(
      `Não foi possível desfazer o salvamento; a tarefa pode estar inconsistente. Recarregue a lista. (${updateError.message})`
    )
  }

  try {
    await restoreSubtarefas(editingTodo.id, userId, editingTodo.subtarefas ?? [])
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'erro desconhecido'
    throw new Error(`Não foi possível desfazer as subtarefas; recarregue a lista. (${detail})`, {
      cause: err,
    })
  }
}

async function rollbackTodoStatus(
  todoId: string,
  status: TodoStatus,
  completed_at: string | null
): Promise<void> {
  const { error } = await supabase.from('tarefas').update({ status, completed_at }).eq('id', todoId)

  if (error) {
    throw new Error(
      `Erro ao criar próxima ocorrência e não foi possível desfazer a conclusão. Recarregue a lista. (${error.message})`
    )
  }
}

async function createNextRecurringTodoWithRollback(
  todo: Todo,
  rollback: () => Promise<void>
): Promise<Todo | null> {
  try {
    return await createNextRecurringTodo(todo)
  } catch (err) {
    await rollback()
    throw err instanceof Error ? err : new Error('Erro ao criar próxima ocorrência.')
  }
}

async function maybeCreateNextRecurringOnSave(
  savedTodo: Todo,
  data: TodoFormData,
  editingTodo?: Todo | null,
  userId?: string
): Promise<Todo | null> {
  if (!shouldCreateNextOnSave(data, editingTodo?.status ?? null)) return null

  if (editingTodo && userId) {
    return createNextRecurringTodoWithRollback(savedTodo, () =>
      rollbackEditedTodo(editingTodo, userId)
    )
  }

  return createNextRecurringTodo(savedTodo)
}

export async function saveTodo(
  data: TodoFormData,
  editingTodo?: Todo | null
): Promise<SaveTodoResult> {
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

    try {
      await syncSubtarefas(editingTodo.id, user.id, data.subtarefas, editingTodo.subtarefas)
      await syncTodoAnexo(editingTodo.id, user.id, data, editingTodo)
    } catch (err) {
      await rollbackEditedTodo(editingTodo, user.id)
      throw err instanceof Error ? err : new Error('Erro ao salvar tarefa.')
    }

    const savedTodo = await fetchTodoWithSubtarefas(editingTodo.id)
    const createdNextTodo = await maybeCreateNextRecurringOnSave(
      savedTodo,
      data,
      editingTodo,
      user.id
    )
    return { savedTodo, createdNextTodo }
  }

  const { data: created, error: insertError } = await supabase
    .from('tarefas')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  try {
    const subtarefas = await insertSubtarefas(created.id, user.id, data.subtarefas)

    if (data.anexoFile) {
      await syncTodoAnexo(created.id, user.id, data)
      const savedTodo = await fetchTodoWithSubtarefas(created.id)
      const createdNextTodo = await maybeCreateNextRecurringOnSave(savedTodo, data)
      return { savedTodo, createdNextTodo }
    }

    const savedTodo = { ...created, subtarefas }
    const createdNextTodo = await maybeCreateNextRecurringOnSave(savedTodo, data)
    return { savedTodo, createdNextTodo }
  } catch (err) {
    await rollbackCreatedTodo(created.id)
    throw err instanceof Error ? err : new Error('Erro ao salvar tarefa.')
  }
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

async function hasActiveOccurrenceInSeries(
  userId: string,
  seriesRootId: string,
  excludeTodoId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('tarefas')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pendente', 'em_andamento'])
    .neq('id', excludeTodoId)
    .or(`recorrencia_origem_id.eq.${seriesRootId},id.eq.${seriesRootId}`)
    .neq('recorrencia_tipo', 'nenhuma')
    .limit(1)

  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

async function createNextRecurringTodo(todo: Todo): Promise<Todo | null> {
  const nextDate = getNextRecurringDate(
    todo.data_prevista,
    todo.recorrencia_tipo,
    todo.recorrencia_intervalo
  )
  if (!nextDate) return null

  const seriesRootId = getRecurrenceSeriesRootId(todo)
  if (await hasActiveOccurrenceInSeries(todo.user_id, seriesRootId, todo.id)) {
    return null
  }

  const { data: created, error: insertError } = await supabase
    .from('tarefas')
    .insert({
      user_id: todo.user_id,
      titulo: todo.titulo,
      descricao: todo.descricao,
      data_prevista: nextDate,
      status: 'pendente',
      prioridade: todo.prioridade,
      categoria_id: todo.categoria_id,
      completed_at: null,
      recorrencia_tipo: todo.recorrencia_tipo,
      recorrencia_intervalo: todo.recorrencia_intervalo,
      recorrencia_fim: todo.recorrencia_fim,
      recorrencia_origem_id: todo.recorrencia_origem_id ?? todo.id,
      lembrete_email: todo.lembrete_email,
      lembrete_tipo: todo.lembrete_tipo,
    })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  try {
    const subtarefas = await insertSubtarefas(
      created.id,
      todo.user_id,
      (todo.subtarefas ?? []).map((sub) => ({
        clientKey: sub.id,
        titulo: sub.titulo,
        concluida: false,
      }))
    )
    return { ...created, subtarefas }
  } catch (err) {
    await rollbackCreatedTodo(created.id)
    throw err instanceof Error ? err : new Error('Erro ao criar próxima ocorrência.')
  }
}

export async function toggleTodoStatus(todo: Todo): Promise<ToggleTodoStatusResult> {
  if (todo.status === 'cancelada') {
    throw new Error('Tarefa cancelada não pode mudar de status')
  }

  const newStatus = getNextStatusOnToggle(todo.status)
  const completed_at = completedAtForStatusChange(newStatus, todo.status, todo.completed_at)

  const { data: updated, error: updateError } = await supabase
    .from('tarefas')
    .update({ status: newStatus, completed_at })
    .eq('id', todo.id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  const updatedTodo = mergeTodoSubtarefas(updated, todo)

  const createdNextTodo = shouldCreateNextOccurrence(todo, newStatus)
    ? await createNextRecurringTodoWithRollback(todo, () =>
        rollbackTodoStatus(todo.id, todo.status, todo.completed_at)
      )
    : null

  return { updatedTodo, createdNextTodo }
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
