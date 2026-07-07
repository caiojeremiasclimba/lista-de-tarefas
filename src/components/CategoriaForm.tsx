import { useState, useEffect } from 'react'
import type { SubmitEvent } from 'react'
import {
  CATEGORIA_CORES,
  CATEGORIA_COR_CONFIG,
  DEFAULT_CATEGORIA_COR,
} from '../constants/categoriaCor'
import type { Categoria, CategoriaCor, CategoriaFormData } from '../types/categoria'

interface CategoriaFormProps {
  editingCategoria?: Categoria | null
  titleId?: string
  onSubmit: (data: CategoriaFormData) => Promise<void>
  onClose?: () => void
}

export default function CategoriaForm({
  editingCategoria,
  titleId,
  onSubmit,
  onClose,
}: CategoriaFormProps) {
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState<CategoriaCor>(DEFAULT_CATEGORIA_COR)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditing = Boolean(editingCategoria)

  useEffect(() => {
    setNome(editingCategoria?.nome ?? '')
    setCor(editingCategoria?.cor ?? DEFAULT_CATEGORIA_COR)
    setErro(null)
    setSubmitError(null)
  }, [editingCategoria])

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const trimmed = nome.trim()
    if (!trimmed) {
      setErro('Informe o nome da categoria.')
      return
    }
    setErro(null)

    setLoading(true)
    try {
      await onSubmit({ nome: trimmed, cor })
      if (!isEditing) {
        setNome('')
        setCor(DEFAULT_CATEGORIA_COR)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 id={titleId} className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {isEditing ? 'Editar categoria' : 'Nova categoria'}
      </h2>

      <div>
        <label
          htmlFor="categoria-nome"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Nome *
        </label>
        <input
          id="categoria-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Ex: Trabalho"
        />
        {erro && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erro}</p>}
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Cor
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIA_CORES.map((corOption) => {
            const config = CATEGORIA_COR_CONFIG[corOption]
            const isSelected = cor === corOption

            return (
              <button
                key={corOption}
                type="button"
                aria-label={`Cor ${config.label}`}
                aria-pressed={isSelected}
                onClick={() => setCor(corOption)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                  isSelected
                    ? 'border-slate-800 dark:border-slate-100'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <span className={`h-6 w-6 rounded-full ${config.dotClass}`} aria-hidden />
              </button>
            )
          })}
        </div>
      </fieldset>

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
          {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
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
