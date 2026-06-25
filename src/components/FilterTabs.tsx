import { CheckCircleIcon, ClockIcon, ListIcon } from './TodosUi'

export type FiltroTarefas = 'todas' | 'pendentes' | 'concluidas'

interface FilterTabsProps {
  active: FiltroTarefas
  onChange: (filtro: FiltroTarefas) => void
  counts: { todas: number; pendentes: number; concluidas: number }
}

const tabs: { id: FiltroTarefas; label: string; Icon: typeof ListIcon }[] = [
  { id: 'todas', label: 'Todas', Icon: ListIcon },
  { id: 'pendentes', label: 'Pendentes', Icon: ClockIcon },
  { id: 'concluidas', label: 'Concluídas', Icon: CheckCircleIcon },
]

export default function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
