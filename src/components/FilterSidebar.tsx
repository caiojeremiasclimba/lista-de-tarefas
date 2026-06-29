import type { TodoStatus } from '../types/todo'
import {
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ListIcon,
  PlayCircleIcon,
  XCircleIcon,
} from './TodosUi'

export type FiltroTarefas = 'todas' | TodoStatus | 'vencidas'

export type FiltroCounts = Record<FiltroTarefas, number>

interface FilterSidebarProps {
  active: FiltroTarefas
  onChange: (filtro: FiltroTarefas) => void
  counts: FiltroCounts
}

type FilterItem = { id: FiltroTarefas; label: string; Icon: typeof ListIcon }

const overviewFilters: FilterItem[] = [
  { id: 'todas', label: 'Todas', Icon: ListIcon },
  { id: 'vencidas', label: 'Vencidas', Icon: AlertIcon },
]

const statusFilters: FilterItem[] = [
  { id: 'pendente', label: 'Pendentes', Icon: ClockIcon },
  { id: 'em_andamento', label: 'Em andamento', Icon: PlayCircleIcon },
  { id: 'concluida', label: 'Concluídas', Icon: CheckCircleIcon },
  { id: 'cancelada', label: 'Canceladas', Icon: XCircleIcon },
]

function FilterButton({
  id,
  label,
  Icon,
  active,
  count,
  onChange,
}: FilterItem & {
  active: FiltroTarefas
  count: number
  onChange: (filtro: FiltroTarefas) => void
}) {
  const isActive = active === id
  const isOverdueHighlight = id === 'vencidas' && count > 0

  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      aria-current={isActive ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? 'bg-blue-50 font-medium text-blue-700'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      <span
        className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${
          isOverdueHighlight
            ? 'bg-red-50 text-red-600'
            : isActive
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function FilterGroup({
  title,
  items,
  active,
  counts,
  onChange,
}: {
  title: string
  items: FilterItem[]
  active: FiltroTarefas
  counts: FiltroCounts
  onChange: (filtro: FiltroTarefas) => void
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {items.map((item) => (
        <FilterButton
          key={item.id}
          {...item}
          active={active}
          count={counts[item.id]}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

export default function FilterSidebar({ active, onChange, counts }: FilterSidebarProps) {
  return (
    <nav aria-label="Filtros de tarefas" className="space-y-6 px-3 py-6">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Filtros
      </p>
      <FilterGroup
        title="Visão geral"
        items={overviewFilters}
        active={active}
        counts={counts}
        onChange={onChange}
      />
      <FilterGroup
        title="Por status"
        items={statusFilters}
        active={active}
        counts={counts}
        onChange={onChange}
      />
    </nav>
  )
}
