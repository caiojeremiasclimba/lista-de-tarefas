import {
  TODO_ORDENACAO_CONFIG,
  TODO_ORDENACOES,
  type TodoOrdenacao,
} from '../constants/todoOrdenacao'

interface SortSelectProps {
  value: TodoOrdenacao
  onChange: (value: TodoOrdenacao) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="w-full shrink-0 sm:w-auto sm:min-w-[11.5rem]">
      <label htmlFor="ordenacao" className="sr-only">
        Ordenar tarefas
      </label>
      <select
        id="ordenacao"
        value={value}
        onChange={(e) => onChange(e.target.value as TodoOrdenacao)}
        title="Ordenar tarefas"
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-3 pr-8 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:py-3.5 sm:text-base"
      >
        {TODO_ORDENACOES.map((id) => (
          <option key={id} value={id}>
            {TODO_ORDENACAO_CONFIG[id].label}
          </option>
        ))}
      </select>
    </div>
  )
}
