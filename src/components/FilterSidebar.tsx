import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Categoria } from '../types/categoria'
import type { TodoStatus } from '../types/todo'
import {
  AlertIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronIcon,
  ClockIcon,
  DotsVerticalIcon,
  ListIcon,
  PlayCircleIcon,
  TagIcon,
  XCircleIcon,
} from './TodosUi'

export type AppView = 'tarefas' | 'dashboard' | 'perfil'

export type FiltroTarefas = 'todas' | TodoStatus | 'vencidas'

export type FiltroCounts = Record<FiltroTarefas, number>

interface FilterSidebarProps {
  view: AppView
  onViewChange: (view: AppView) => void
  active: FiltroTarefas
  onChange: (filtro: FiltroTarefas) => void
  counts: FiltroCounts
  categorias: Categoria[]
  categoriaAtiva: string | null
  countsPorCategoria: Record<string, number>
  onCategoriaChange: (id: string | null) => void
  onNovaCategoria: () => void
  onEditCategoria: (categoria: Categoria) => void
  onDeleteCategoria: (id: string) => void
}

type ViewItem = { id: AppView; label: string; Icon: typeof ListIcon }

const viewItems: ViewItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: ChartBarIcon },
  { id: 'tarefas', label: 'Tarefas', Icon: ListIcon },
]

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

function ViewButton({
  id,
  label,
  Icon,
  active,
  onChange,
}: ViewItem & {
  active: AppView
  onChange: (view: AppView) => void
}) {
  const isActive = active === id

  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      aria-current={isActive ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

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
        isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50'
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

function CategoryFilterButton({
  categoria,
  active,
  count,
  onChange,
  onEdit,
  onDelete,
}: {
  categoria: Categoria
  active: string | null
  count: number
  onChange: (id: string | null) => void
  onEdit: (categoria: Categoria) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isActive = active === categoria.id

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleEdit() {
    setMenuOpen(false)
    onEdit(categoria)
  }

  function handleDelete() {
    setMenuOpen(false)
    onDelete(categoria.id)
  }

  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl pr-1 transition-colors ${
        isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(isActive ? null : categoria.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive ? 'font-medium text-blue-700' : 'text-slate-600'
        }`}
      >
        <TagIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{categoria.nome}</span>
        <span
          className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${
            isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      </button>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={`Ações da categoria ${categoria.nome}`}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <DotsVerticalIcon className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CollapsibleFilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
      >
        <span>{title}</span>
        <ChevronIcon up={open} className="h-3.5 w-3.5" />
      </button>
      {open && children}
    </div>
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
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
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

export default function FilterSidebar({
  view,
  onViewChange,
  active,
  onChange,
  counts,
  categorias,
  categoriaAtiva,
  countsPorCategoria,
  onCategoriaChange,
  onNovaCategoria,
  onEditCategoria,
  onDeleteCategoria,
}: FilterSidebarProps) {
  const filtersMuted = view === 'dashboard'
  const [statusOpen, setStatusOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)

  return (
    <nav aria-label="Navegação e filtros" className="space-y-6 px-3 py-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Navegação
        </p>
        {viewItems.map((item) => (
          <ViewButton key={item.id} {...item} active={view} onChange={onViewChange} />
        ))}
      </div>

      <div className={filtersMuted ? 'opacity-50' : undefined}>
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Filtros</p>
        {filtersMuted && (
          <p className="px-3 pb-2 text-xs text-slate-400">Aplicam-se à visão Tarefas</p>
        )}
      </div>
      <div className={filtersMuted ? 'pointer-events-none space-y-6 opacity-50' : 'space-y-6'}>
        <FilterGroup
          title="Visão geral"
          items={overviewFilters}
          active={active}
          counts={counts}
          onChange={onChange}
        />
        <CollapsibleFilterSection
          title="Por status"
          open={statusOpen}
          onToggle={() => setStatusOpen((o) => !o)}
        >
          {statusFilters.map((item) => (
            <FilterButton
              key={item.id}
              {...item}
              active={active}
              count={counts[item.id]}
              onChange={onChange}
            />
          ))}
        </CollapsibleFilterSection>
        <CollapsibleFilterSection
          title="Por categoria"
          open={categoriaOpen}
          onToggle={() => setCategoriaOpen((o) => !o)}
        >
          {categorias.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Nenhuma categoria ainda</p>
          ) : (
            categorias.map((cat) => (
              <CategoryFilterButton
                key={cat.id}
                categoria={cat}
                active={categoriaAtiva}
                count={countsPorCategoria[cat.id] ?? 0}
                onChange={onCategoriaChange}
                onEdit={onEditCategoria}
                onDelete={onDeleteCategoria}
              />
            ))
          )}
          <button
            type="button"
            onClick={onNovaCategoria}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            <span aria-hidden>+</span>
            Nova categoria
          </button>
        </CollapsibleFilterSection>
      </div>
    </nav>
  )
}
