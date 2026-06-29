import type { Subtarefa, SubtarefaDraft } from '../types/subtarefa'
import { createSubtarefaDraft, getSubtarefaDraftKey } from '../types/subtarefa'

interface SubtarefaListReadonlyProps {
  mode: 'readonly'
  subtarefas: Subtarefa[]
  disabled?: boolean
  onToggle: (sub: Subtarefa) => void
}

interface SubtarefaListEditableProps {
  mode: 'editable'
  subtarefas: SubtarefaDraft[]
  onChange: (subtarefas: SubtarefaDraft[]) => void
}

type SubtarefaListProps = SubtarefaListReadonlyProps | SubtarefaListEditableProps

export default function SubtarefaList(props: SubtarefaListProps) {
  if (props.mode === 'readonly') {
    const { subtarefas, disabled, onToggle } = props

    if (subtarefas.length === 0) return null

    return (
      <ul className="space-y-1.5">
        {subtarefas.map((sub) => (
          <li key={sub.id} className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => !disabled && onToggle(sub)}
              disabled={disabled}
              aria-label={sub.concluida ? 'Desmarcar subtarefa' : 'Marcar subtarefa'}
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
                  : sub.concluida
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-300 bg-white hover:border-blue-400'
              }`}
            >
              {sub.concluida && (
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className={`text-sm ${
                sub.concluida ? 'line-through text-slate-400' : 'text-slate-700'
              }`}
            >
              {sub.titulo}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  const { subtarefas, onChange } = props

  function updateTitulo(index: number, titulo: string) {
    onChange(
      subtarefas.map((s, i) =>
        i === index ? { ...s, titulo, concluida: s.concluida ?? false } : s
      )
    )
  }

  function removeItem(index: number) {
    onChange(subtarefas.filter((_, i) => i !== index))
  }

  function addItem() {
    onChange([...subtarefas, createSubtarefaDraft()])
  }

  return (
    <div className="space-y-2">
      {subtarefas.map((sub, index) => (
        <div key={getSubtarefaDraftKey(sub)} className="flex items-center gap-2">
          <input
            type="text"
            value={sub.titulo}
            onChange={(e) => updateTitulo(index, e.target.value)}
            placeholder="Descrição da subtarefa"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label="Remover subtarefa"
            className="shrink-0 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Remover
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        + Adicionar subtarefa
      </button>
    </div>
  )
}
