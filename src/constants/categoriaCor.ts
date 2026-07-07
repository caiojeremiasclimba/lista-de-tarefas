import type { CategoriaCor } from '../types/categoria'

export const DEFAULT_CATEGORIA_COR: CategoriaCor = 'slate'

export const CATEGORIA_CORES: CategoriaCor[] = [
  'slate',
  'blue',
  'violet',
  'emerald',
  'amber',
  'rose',
  'cyan',
  'orange',
]

export interface CategoriaCorConfig {
  label: string
  dotClass: string
  badgeClass: string
}

export const CATEGORIA_COR_CONFIG: Record<CategoriaCor, CategoriaCorConfig> = {
  slate: {
    label: 'Cinza',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  },
  blue: {
    label: 'Azul',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  violet: {
    label: 'Violeta',
    dotClass: 'bg-violet-500',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  },
  emerald: {
    label: 'Verde',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  amber: {
    label: 'Âmbar',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  },
  rose: {
    label: 'Rosa',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  },
  cyan: {
    label: 'Ciano',
    dotClass: 'bg-cyan-500',
    badgeClass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  },
  orange: {
    label: 'Laranja',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  },
}

export function isCategoriaCor(value: unknown): value is CategoriaCor {
  return typeof value === 'string' && CATEGORIA_CORES.includes(value as CategoriaCor)
}

export function getCategoriaCorConfig(
  cor: CategoriaCor = DEFAULT_CATEGORIA_COR
): CategoriaCorConfig {
  return CATEGORIA_COR_CONFIG[cor]
}
