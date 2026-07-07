import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { getUserDisplayName } from '../../utils/userDisplay'
import FilterSidebar, {
  type AppView,
  type FiltroCounts,
  type FiltroTarefas,
} from '../FilterSidebar'
import ThemeToggle from '../ThemeToggle'
import UserAvatar from '../UserAvatar'
import { LogOutIcon, MenuIcon, XIcon } from '../TodosUi'
import type { Categoria } from '../../types/categoria'
import type { TodoPrioridade } from '../../types/todo'

interface AppShellProps {
  user: User
  onLogout: () => void
  sidebarOpen: boolean
  onCloseSidebar: () => void
  onOpenSidebar: () => void
  view: AppView
  onViewChange: (view: AppView) => void
  onOpenPerfil: () => void
  mobileHeaderTitle: string
  mobileHeaderSubtitle: string | null
  filtroAtivo: FiltroTarefas
  onFiltroChange: (filtro: FiltroTarefas) => void
  counts: FiltroCounts
  categorias: Categoria[]
  filtroCategoria: string | null
  countsPorCategoria: Record<string, number>
  onCategoriaChange: (id: string | null) => void
  prioridadeAtiva: TodoPrioridade | null
  countsPorPrioridade: Record<TodoPrioridade, number>
  onPrioridadeChange: (prioridade: TodoPrioridade | null) => void
  onNovaCategoria: () => void
  onEditCategoria: (categoria: Categoria) => void
  onDeleteCategoria: (id: string) => void
  children: ReactNode
  fab?: ReactNode
}

function AppBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
    </>
  )
}

export default function AppShell({
  user,
  onLogout,
  sidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
  view,
  onViewChange,
  onOpenPerfil,
  mobileHeaderTitle,
  mobileHeaderSubtitle,
  filtroAtivo,
  onFiltroChange,
  counts,
  categorias,
  filtroCategoria,
  countsPorCategoria,
  onCategoriaChange,
  prioridadeAtiva,
  countsPorPrioridade,
  onPrioridadeChange,
  onNovaCategoria,
  onEditCategoria,
  onDeleteCategoria,
  children,
  fab,
}: AppShellProps) {
  const displayName = getUserDisplayName(user)

  return (
    <div className="relative h-dvh overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <AppBackground />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 max-w-[85vw] flex-col overflow-hidden border-r border-slate-200/60 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-700/60 dark:bg-slate-900/95 md:z-10 md:w-56 md:max-w-none md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/60 px-3 py-3 dark:border-slate-700/60 md:hidden">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Menu</span>
          <button
            type="button"
            onClick={onCloseSidebar}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <FilterSidebar
            view={view}
            onViewChange={onViewChange}
            active={filtroAtivo}
            onChange={onFiltroChange}
            counts={counts}
            categorias={categorias}
            categoriaAtiva={filtroCategoria}
            countsPorCategoria={countsPorCategoria}
            onCategoriaChange={onCategoriaChange}
            prioridadeAtiva={prioridadeAtiva}
            countsPorPrioridade={countsPorPrioridade}
            onPrioridadeChange={onPrioridadeChange}
            onNovaCategoria={onNovaCategoria}
            onEditCategoria={onEditCategoria}
            onDeleteCategoria={onDeleteCategoria}
          />
        </div>

        <div className="shrink-0 border-t border-slate-200/60 px-4 py-4 dark:border-slate-700/60">
          <ThemeToggle showLabel className="mb-3 w-full justify-center" />
          <button
            type="button"
            onClick={() => onViewChange('perfil')}
            aria-label="Abrir perfil"
            className="flex min-w-0 w-full items-center gap-2.5 rounded-xl px-1 py-1 transition hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            <UserAvatar user={user} size="sm" />
            <p className="min-w-0 truncate text-sm text-slate-500 dark:text-slate-400">{displayName}</p>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100"
          >
            <LogOutIcon />
            Sair
          </button>
        </div>
      </aside>

      <div className="relative flex h-dvh w-full min-w-0 flex-col overflow-hidden md:ml-56 md:w-[calc(100%-14rem)]">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/60 bg-white/70 px-3 py-3 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/70 md:hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{mobileHeaderTitle}</p>
            {mobileHeaderSubtitle && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{mobileHeaderSubtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenPerfil}
            aria-label="Abrir perfil"
            className="shrink-0 rounded-full transition hover:ring-2 hover:ring-blue-200"
          >
            <UserAvatar user={user} size="sm" />
          </button>
        </header>

        <main className="min-h-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-6 pb-24 sm:px-6">
          {children}
        </main>

        {fab}
      </div>
    </div>
  )
}
