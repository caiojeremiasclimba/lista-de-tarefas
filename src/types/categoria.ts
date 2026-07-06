export type CategoriaCor =
  'slate' | 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'orange'

export interface Categoria {
  id: string
  user_id: string
  nome: string
  cor: CategoriaCor
  created_at: string
}

export interface CategoriaFormData {
  nome: string
  cor: CategoriaCor
}

export interface CategoriaDisplay {
  nome: string
  cor: CategoriaCor
}
