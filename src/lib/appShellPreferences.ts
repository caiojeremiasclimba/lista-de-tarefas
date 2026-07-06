import type { AppView, FiltroTarefas } from '../components/FilterSidebar'
import {
  DEFAULT_TODO_ORDENACAO,
  TODO_ORDENACOES,
  type TodoOrdenacao,
} from '../constants/todoOrdenacao'
import { TODO_PRIORIDADES } from '../constants/todoPrioridade'
import { TODO_STATUSES } from '../constants/todoStatus'
import type { TodoPrioridade, TodoStatus } from '../types/todo'
import type { SecoesAbertas } from '../utils/todoFilters'

export const APP_SHELL_PREFS_KEY = 'lista-tarefas:app-shell'

const APP_VIEWS: AppView[] = ['tarefas', 'dashboard', 'perfil']
const FILTRO_TAREFAS: FiltroTarefas[] = ['todas', 'vence_hoje', 'vencidas', ...TODO_STATUSES]
const SECOES_KEYS: (TodoStatus | 'vencidas' | 'vence_hoje')[] = [
  ...TODO_STATUSES,
  'vence_hoje',
  'vencidas',
]

export const DEFAULT_SECOES_ABERTAS: SecoesAbertas = {
  pendente: true,
  em_andamento: true,
  concluida: true,
  cancelada: true,
  vence_hoje: true,
  vencidas: true,
}

export interface AppShellPreferences {
  version: 1
  view: AppView
  filtroAtivo: FiltroTarefas
  filtroCategoria: string | null
  filtroPrioridade: TodoPrioridade | null
  ordenacao: TodoOrdenacao
  secoesAbertas: SecoesAbertas
}

export function getDefaultAppShellPreferences(): AppShellPreferences {
  return {
    version: 1,
    view: 'tarefas',
    filtroAtivo: 'todas',
    filtroCategoria: null,
    filtroPrioridade: null,
    ordenacao: DEFAULT_TODO_ORDENACAO,
    secoesAbertas: { ...DEFAULT_SECOES_ABERTAS },
  }
}

function isAppView(value: unknown): value is AppView {
  return typeof value === 'string' && APP_VIEWS.includes(value as AppView)
}

function isFiltroTarefas(value: unknown): value is FiltroTarefas {
  return typeof value === 'string' && FILTRO_TAREFAS.includes(value as FiltroTarefas)
}

function isTodoPrioridade(value: unknown): value is TodoPrioridade {
  return typeof value === 'string' && TODO_PRIORIDADES.includes(value as TodoPrioridade)
}

function isTodoOrdenacao(value: unknown): value is TodoOrdenacao {
  return typeof value === 'string' && TODO_ORDENACOES.includes(value as TodoOrdenacao)
}

function parseFiltroCategoria(value: unknown): string | null | undefined {
  if (value === null) return null
  if (typeof value === 'string' && value.trim().length > 0) return value
  return undefined
}

function parseSecoesAbertas(value: unknown): SecoesAbertas | undefined {
  if (typeof value !== 'object' || value === null) return undefined

  const record = value as Record<string, unknown>
  const result = {} as SecoesAbertas

  for (const key of SECOES_KEYS) {
    if (typeof record[key] !== 'boolean') return undefined
    result[key] = record[key]
  }

  return result
}

function parseStoredPreferences(raw: unknown): AppShellPreferences | null {
  if (typeof raw !== 'object' || raw === null) return null

  const data = raw as Record<string, unknown>
  if (data.version !== 1) return null

  if (!isAppView(data.view)) return null
  if (!isFiltroTarefas(data.filtroAtivo)) return null

  const filtroCategoria = parseFiltroCategoria(data.filtroCategoria)
  if (filtroCategoria === undefined) return null

  if (data.filtroPrioridade !== null && !isTodoPrioridade(data.filtroPrioridade)) return null

  const ordenacao = isTodoOrdenacao(data.ordenacao) ? data.ordenacao : DEFAULT_TODO_ORDENACAO

  const secoesAbertas = parseSecoesAbertas(data.secoesAbertas)
  if (!secoesAbertas) return null

  return {
    version: 1,
    view: data.view,
    filtroAtivo: data.filtroAtivo,
    filtroCategoria,
    filtroPrioridade: data.filtroPrioridade as TodoPrioridade | null,
    ordenacao,
    secoesAbertas,
  }
}

export function loadAppShellPreferences(): AppShellPreferences | null {
  try {
    const stored = localStorage.getItem(APP_SHELL_PREFS_KEY)
    if (!stored) return null
    return parseStoredPreferences(JSON.parse(stored))
  } catch {
    return null
  }
}

export function saveAppShellPreferences(prefs: AppShellPreferences): void {
  localStorage.setItem(APP_SHELL_PREFS_KEY, JSON.stringify(prefs))
}
