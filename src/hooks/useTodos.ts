import { useCallback, useEffect, useState } from 'react'
import { toast } from '../lib/toast'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo, TodoFormData } from '../types/todo'
import {
  deleteTodo as deleteTodoService,
  fetchTodos as fetchTodosService,
  saveTodo,
  toggleSubtarefa as toggleSubtarefaService,
  toggleTodoStatus,
} from '../services/todoService'
import { useSupabaseRealtime } from './useSupabaseRealtime'

const TODOS_REALTIME_TABLES = ['tarefas', 'subtarefas'] as const

export function useTodos(userId: string) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const loadTodos = useCallback(async () => {
    try {
      const data = await fetchTodosService()
      setTodos(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar tarefas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTodos()
  }, [loadTodos])

  useSupabaseRealtime(userId, TODOS_REALTIME_TABLES, loadTodos)

  const submitTodo = useCallback(async (data: TodoFormData, editingTodo?: Todo | null) => {
    try {
      const saved = await saveTodo(data, editingTodo)

      if (editingTodo) {
        setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? saved : t)))
      } else {
        setTodos((prev) => [saved, ...prev])
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar tarefa.')
      throw err
    }
  }, [])

  const deleteTodo = useCallback(
    async (
      id: string,
      options?: { editingTodoId?: string | null; onCloseForm?: () => void }
    ): Promise<boolean> => {
      const todo = todos.find((t) => t.id === id)

      try {
        await deleteTodoService(id, todo?.anexo_path)
        setTodos((prev) => prev.filter((t) => t.id !== id))
        if (options?.editingTodoId === id) {
          options.onCloseForm?.()
        }
        return true
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir tarefa.')
        return false
      }
    },
    [todos]
  )

  const handleToggleStatus = useCallback(async (todo: Todo) => {
    if (todo.status === 'cancelada') return

    try {
      const updated = await toggleTodoStatus(todo)
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status.')
    }
  }, [])

  const handleToggleSubtarefa = useCallback(
    async (sub: Subtarefa) => {
      const parent = todos.find((t) => t.id === sub.tarefa_id)
      if (!parent || parent.status === 'cancelada') return

      try {
        const updated = await toggleSubtarefaService(sub)
        setTodos((prev) =>
          prev.map((t) =>
            t.id !== sub.tarefa_id
              ? t
              : {
                  ...t,
                  subtarefas: t.subtarefas?.map((s) => (s.id === sub.id ? updated : s)) ?? [],
                }
          )
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar subtarefa.')
      }
    },
    [todos]
  )

  const unlinkCategoriaFromTodos = useCallback((categoriaId: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.categoria_id === categoriaId ? { ...t, categoria_id: null } : t))
    )
  }, [])

  return {
    todos,
    setTodos,
    loading,
    loadTodos,
    submitTodo,
    deleteTodo,
    handleToggleStatus,
    handleToggleSubtarefa,
    unlinkCategoriaFromTodos,
  }
}
