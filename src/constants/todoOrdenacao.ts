export type TodoOrdenacao = 'inteligente' | 'data_prevista' | 'prioridade' | 'recentes' | 'titulo'

export const DEFAULT_TODO_ORDENACAO: TodoOrdenacao = 'inteligente'

export const TODO_ORDENACOES: TodoOrdenacao[] = [
  'inteligente',
  'data_prevista',
  'prioridade',
  'recentes',
  'titulo',
]

export const TODO_ORDENACAO_CONFIG: Record<TodoOrdenacao, { label: string }> = {
  inteligente: { label: 'Inteligente' },
  data_prevista: { label: 'Data prevista' },
  prioridade: { label: 'Prioridade' },
  recentes: { label: 'Mais recentes' },
  titulo: { label: 'Título (A–Z)' },
}
