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
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  blue: {
    label: 'Azul',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  violet: {
    label: 'Violeta',
    dotClass: 'bg-violet-500',
    badgeClass: 'bg-violet-100 text-violet-700',
  },
  emerald: {
    label: 'Verde',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    label: 'Âmbar',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  rose: {
    label: 'Rosa',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-100 text-rose-700',
  },
  cyan: {
    label: 'Ciano',
    dotClass: 'bg-cyan-500',
    badgeClass: 'bg-cyan-100 text-cyan-700',
  },
  orange: {
    label: 'Laranja',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800',
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
