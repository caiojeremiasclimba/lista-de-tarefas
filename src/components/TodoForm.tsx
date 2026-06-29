import { useState, useEffect } from 'react'
import type { SubmitEvent } from 'react'
import type { Categoria } from '../types/categoria'
import type { Todo, TodoFormData, TodoStatus } from '../types/todo'
import { TODO_STATUS_CONFIG, TODO_STATUSES } from '../constants/todoStatus'
import { validateTodo } from '../utils/validateTodo'

interface TodoFormProps {
  editingTodo?: Todo | null
  categorias: Categoria[]
  defaultCategoriaId?: string | null
  onSubmit: (data: TodoFormData) => Promise<void>
  onClose?: () => void
}

const emptyForm: TodoFormData = {
  titulo: '',
  descricao: '',
  data_prevista: '',
  status: 'pendente',
  categoria_id: '',
}

export default function TodoForm({
  editingTodo,
  categorias,
  defaultCategoriaId,
  onSubmit,
  onClose,
}: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>(emptyForm)
  const [erros, setErros] = useState<ReturnType<typeof validateTodo>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditing = Boolean(editingTodo)

  useEffect(() => {
    if (editingTodo) {
      setForm({
        titulo: editingTodo.titulo,
        descricao: editingTodo.descricao ?? '',
        data_prevista: editingTodo.data_prevista ?? '',
        status: editingTodo.status,
        categoria_id: editingTodo.categoria_id ?? '',
      })
    } else {
      setForm({
        ...emptyForm,
        categoria_id: defaultCategoriaId ?? '',
      })
    }
    setErros({})
    setSubmitError(null)
  }, [editingTodo, defaultCategoriaId])

  function updateField<K extends keyof TodoFormData>(field: K, value: TodoFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateTodo(form)
    setErros(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await onSubmit(form)
      if (!isEditing) {
        setForm({ ...emptyForm, categoria_id: defaultCategoriaId ?? '' })
      }
      setErros({})
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar tarefa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        {isEditing ? 'Editar tarefa' : 'Nova tarefa'}
      </h2>

      <div>
        <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-slate-700">
          Título *
        </label>
        <input
          id="titulo"
          type="text"
          value={form.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Ex: Estudar React"
        />
        {erros.titulo && <p className="mt-1 text-sm text-red-600">{erros.titulo}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={form.descricao}
          onChange={(e) => updateField('descricao', e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Detalhes da tarefa (opcional)"
        />
      </div>

      <div>
        <label htmlFor="categoria_id" className="mb-1 block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select
          id="categoria_id"
          value={form.categoria_id}
          onChange={(e) => updateField('categoria_id', e.target.value)}
          disabled={categorias.length === 0}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {categorias.length === 0 && (
          <p className="mt-1 text-sm text-slate-500">Crie uma categoria na sidebar</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="data_prevista" className="mb-1 block text-sm font-medium text-slate-700">
            Data prevista
          </label>
          <input
            id="data_prevista"
            type="date"
            value={form.data_prevista}
            onChange={(e) => updateField('data_prevista', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {erros.data_prevista && (
            <p className="mt-1 text-sm text-red-600">{erros.data_prevista}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value as TodoStatus)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {TODO_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TODO_STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar tarefa'}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
