import { SearchIcon } from './TodosUi'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        <SearchIcon className="h-5 w-5" />
      </span>
      <input
        id="search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar..."
        title="Buscar por título ou descrição"
        className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 sm:py-3.5 sm:pl-12 sm:pr-4 sm:text-base"
      />
    </div>
  )
}
