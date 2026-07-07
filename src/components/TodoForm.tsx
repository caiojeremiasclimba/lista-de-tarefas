import { useState, useEffect, useRef } from 'react'
import type { SubmitEvent, ChangeEvent } from 'react'
import type { Categoria } from '../types/categoria'
import { createSubtarefaDraft } from '../types/subtarefa'
import type {
  Todo,
  TodoFormData,
  TodoPrioridade,
  TodoRecorrenciaTipo,
  TodoStatus,
} from '../types/todo'
import { TODO_PRIORIDADE_CONFIG, TODO_PRIORIDADES } from '../constants/todoPrioridade'
import { TODO_RECORRENCIA_CONFIG, TODO_RECORRENCIA_TIPOS } from '../constants/todoRecorrencia'
import { TODO_STATUS_CONFIG, TODO_STATUSES } from '../constants/todoStatus'
import { validateAttachmentFile } from '../utils/attachmentStorage'
import { validateTodo } from '../utils/validateTodo'
import SubtarefaList from './SubtarefaList'

interface TodoFormProps {
  editingTodo?: Todo | null
  categorias: Categoria[]
  defaultCategoriaId?: string | null
  titleId?: string
  onSubmit: (data: TodoFormData) => Promise<void>
  onClose?: () => void
}

const emptyForm: TodoFormData = {
  titulo: '',
  descricao: '',
  data_prevista: '',
  status: 'pendente',
  prioridade: 'media',
  categoria_id: '',
  subtarefas: [],
  anexoFile: null,
  removerAnexo: false,
  recorrencia_tipo: 'nenhuma',
  recorrencia_intervalo: 1,
  recorrencia_fim: '',
}

export default function TodoForm({
  editingTodo,
  categorias,
  defaultCategoriaId,
  titleId,
  onSubmit,
  onClose,
}: TodoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<TodoFormData>(emptyForm)
  const [erros, setErros] = useState<ReturnType<typeof validateTodo>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [anexoPreviewUrl, setAnexoPreviewUrl] = useState<string | null>(null)
  const [anexoError, setAnexoError] = useState<string | null>(null)

  const isEditing = Boolean(editingTodo)
  const hasExistingAnexo = Boolean(editingTodo?.anexo_path) && !form.removerAnexo && !form.anexoFile
  const hasRecorrencia = form.recorrencia_tipo !== 'nenhuma'
  const recorrenciaIntervalLabel = TODO_RECORRENCIA_CONFIG[form.recorrencia_tipo].intervalPlural

  useEffect(() => {
    if (editingTodo) {
      setForm({
        titulo: editingTodo.titulo,
        descricao: editingTodo.descricao ?? '',
        data_prevista: editingTodo.data_prevista ?? '',
        status: editingTodo.status,
        prioridade: editingTodo.prioridade,
        categoria_id: editingTodo.categoria_id ?? '',
        subtarefas: (editingTodo.subtarefas ?? []).map((s) =>
          createSubtarefaDraft({
            id: s.id,
            titulo: s.titulo,
            concluida: s.concluida,
            clientKey: s.id,
          })
        ),
        anexoFile: null,
        removerAnexo: false,
        recorrencia_tipo: editingTodo.recorrencia_tipo,
        recorrencia_intervalo: editingTodo.recorrencia_intervalo,
        recorrencia_fim: editingTodo.recorrencia_fim ?? '',
      })
    } else {
      setForm({
        ...emptyForm,
        categoria_id: defaultCategoriaId ?? '',
      })
    }
    setAnexoPreviewUrl(null)
    setAnexoError(null)
    setErros({})
    setSubmitError(null)
    // defaultCategoriaId omitido de propósito: é snapshot ao abrir "Nova tarefa".
    // Incluí-lo aqui resetaria título, subtarefas e demais campos.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ver comentário acima
  }, [editingTodo])

  useEffect(() => {
    if (!form.anexoFile) {
      setAnexoPreviewUrl(null)
      return
    }

    if (form.anexoFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(form.anexoFile)
      setAnexoPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }

    setAnexoPreviewUrl(null)
  }, [form.anexoFile])

  function updateField<K extends keyof TodoFormData>(field: K, value: TodoFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleAnexoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setAnexoError(null)
    const validationError = validateAttachmentFile(file)
    if (validationError) {
      setAnexoError(validationError)
      return
    }

    setForm((prev) => ({
      ...prev,
      anexoFile: file,
      removerAnexo: false,
    }))
  }

  function handleRemoveAnexo() {
    setAnexoError(null)
    setForm((prev) => ({
      ...prev,
      anexoFile: null,
      removerAnexo: true,
    }))
  }

  function handleToggleRecorrencia(enabled: boolean) {
    setForm((prev) => ({
      ...prev,
      recorrencia_tipo: enabled ? 'semanal' : 'nenhuma',
      recorrencia_intervalo: 1,
      recorrencia_fim: enabled ? prev.recorrencia_fim : '',
    }))
  }

  function handleDataPrevistaChange(value: string) {
    updateField('data_prevista', value)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setAnexoError(null)

    const validationErrors = validateTodo(form)
    setErros(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    if (form.anexoFile) {
      const attachmentError = validateAttachmentFile(form.anexoFile)
      if (attachmentError) {
        setAnexoError(attachmentError)
        return
      }
    }

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
      <h2 id={titleId} className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {isEditing ? 'Editar tarefa' : 'Nova tarefa'}
      </h2>

      <div>
        <label
          htmlFor="titulo"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Título *
        </label>
        <input
          id="titulo"
          type="text"
          value={form.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Ex: Estudar React"
        />
        {erros.titulo && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erros.titulo}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Descrição
        </label>
        <textarea
          id="descricao"
          value={form.descricao}
          onChange={(e) => updateField('descricao', e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Detalhes da tarefa (opcional)"
        />
      </div>

      <div>
        <label
          htmlFor="anexo"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Anexo
        </label>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Imagem (JPEG, PNG, WebP) ou PDF, até 5 MB
        </p>

        {hasExistingAnexo && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <span className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-200">
              {editingTodo?.anexo_nome ?? 'Anexo atual'}
            </span>
            <button
              type="button"
              onClick={handleRemoveAnexo}
              className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remover
            </button>
          </div>
        )}

        {form.anexoFile && (
          <div className="mb-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            {anexoPreviewUrl ? (
              <img
                src={anexoPreviewUrl}
                alt="Preview do anexo"
                className="max-h-32 rounded-lg object-contain"
              />
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-200">{form.anexoFile.name}</p>
            )}
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  anexoFile: null,
                  removerAnexo: hasExistingAnexo ? false : prev.removerAnexo,
                }))
              }
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Cancelar seleção
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="anexo"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleAnexoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          {hasExistingAnexo || form.anexoFile ? 'Trocar arquivo' : 'Escolher arquivo'}
        </button>
        {anexoError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{anexoError}</p>}
      </div>

      <div>
        <label
          htmlFor="categoria_id"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Categoria
        </label>
        <select
          id="categoria_id"
          value={form.categoria_id}
          onChange={(e) => updateField('categoria_id', e.target.value)}
          disabled={categorias.length === 0}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        >
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {categorias.length === 0 && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie uma categoria na sidebar
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Subtarefas
        </label>
        <SubtarefaList
          mode="editable"
          subtarefas={form.subtarefas}
          onChange={(subtarefas) => setForm((prev) => ({ ...prev, subtarefas }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="data_prevista"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Data prevista
          </label>
          <input
            id="data_prevista"
            type="date"
            value={form.data_prevista}
            onChange={(e) => handleDataPrevistaChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          {erros.data_prevista && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erros.data_prevista}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="prioridade"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Prioridade
          </label>
          <select
            id="prioridade"
            value={form.prioridade}
            onChange={(e) => updateField('prioridade', e.target.value as TodoPrioridade)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {TODO_PRIORIDADES.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {TODO_PRIORIDADE_CONFIG[prioridade].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input
            id="recorrencia_ativa"
            type="checkbox"
            checked={hasRecorrencia}
            onChange={(e) => handleToggleRecorrencia(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
          />
          Repetir tarefa
        </label>

        {hasRecorrencia && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="recorrencia_tipo"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Frequência
              </label>
              <select
                id="recorrencia_tipo"
                value={form.recorrencia_tipo}
                onChange={(e) =>
                  updateField('recorrencia_tipo', e.target.value as TodoRecorrenciaTipo)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {TODO_RECORRENCIA_TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TODO_RECORRENCIA_CONFIG[tipo].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="recorrencia_intervalo"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Intervalo
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="recorrencia_intervalo"
                  type="number"
                  min={1}
                  value={form.recorrencia_intervalo}
                  onChange={(e) => updateField('recorrencia_intervalo', Number(e.target.value))}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  {recorrenciaIntervalLabel}
                </span>
              </div>
              {erros.recorrencia_intervalo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {erros.recorrencia_intervalo}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="recorrencia_fim"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Repetir até
              </label>
              <input
                id="recorrencia_fim"
                type="date"
                value={form.recorrencia_fim}
                onChange={(e) => updateField('recorrencia_fim', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              {erros.recorrencia_fim && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {erros.recorrencia_fim}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Status
        </label>
        <select
          id="status"
          value={form.status}
          onChange={(e) => updateField('status', e.target.value as TodoStatus)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
          {TODO_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TODO_STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {submitError}
        </p>
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
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
