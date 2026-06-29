import { useState } from 'react'
import type { SubmitEvent } from 'react'

interface CategoriaFormProps {
  onSubmit: (nome: string) => Promise<void>
  onClose?: () => void
}

export default function CategoriaForm({ onSubmit, onClose }: CategoriaFormProps) {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
      await onSubmit(trimmed)
      setNome('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Nova categoria</h2>

      <div>
        <label htmlFor="categoria-nome" className="mb-1 block text-sm font-medium text-slate-700">
          Nome *
        </label>
        <input
          id="categoria-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Ex: Trabalho"
          autoFocus
        />
        {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
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
          {loading ? 'Criando...' : 'Criar'}
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
