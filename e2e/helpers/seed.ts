import type { MockCategoria, MockTodo } from './supabaseMock'
import { E2E_USER } from './supabaseMock'

function baseTodo(
  overrides: Partial<MockTodo> & Pick<MockTodo, 'id' | 'titulo' | 'status'>
): MockTodo {
  return {
    user_id: E2E_USER.id,
    descricao: null,
    data_prevista: null,
    prioridade: 'media',
    categoria_id: null,
    completed_at: null,
    created_at: '2026-06-01T10:00:00.000Z',
    recorrencia_tipo: 'nenhuma',
    recorrencia_intervalo: 1,
    recorrencia_fim: null,
    recorrencia_origem_id: null,
    ...overrides,
  }
}

function baseCategoria(
  overrides: Pick<MockCategoria, 'id' | 'nome'> & Partial<Pick<MockCategoria, 'cor'>>
): MockCategoria {
  return {
    user_id: E2E_USER.id,
    cor: 'slate',
    created_at: '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

/** Tarefas com status variados para testes de filtro e busca. */
export const MIXED_STATUS_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-pendente',
    titulo: 'Tarefa pendente',
    status: 'pendente',
    prioridade: 'media',
    created_at: '2026-06-01T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-andamento',
    titulo: 'Tarefa em andamento',
    status: 'em_andamento',
    prioridade: 'baixa',
    created_at: '2026-06-02T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-concluida',
    titulo: 'Tarefa concluída',
    status: 'concluida',
    prioridade: 'alta',
    completed_at: '2026-06-03T10:00:00.000Z',
    created_at: '2026-06-03T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-busca',
    titulo: 'Relatório mensal',
    descricao: 'Preparar documentação',
    status: 'pendente',
    prioridade: 'alta',
    created_at: '2026-06-04T10:00:00.000Z',
  }),
]

/** Tarefas com prioridades variadas para testes de filtro. */
export const MIXED_PRIORITY_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-alta',
    titulo: 'Tarefa prioridade alta',
    status: 'pendente',
    prioridade: 'alta',
    created_at: '2026-06-01T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-media',
    titulo: 'Tarefa prioridade média',
    status: 'pendente',
    prioridade: 'media',
    created_at: '2026-06-02T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-baixa',
    titulo: 'Tarefa prioridade baixa',
    status: 'pendente',
    prioridade: 'baixa',
    created_at: '2026-06-03T10:00:00.000Z',
  }),
]

export const SEED_CATEGORIAS: MockCategoria[] = [
  baseCategoria({ id: 'e2e-cat-trabalho', nome: 'Trabalho', cor: 'blue' }),
  baseCategoria({ id: 'e2e-cat-pessoal', nome: 'Pessoal', cor: 'emerald' }),
]

export const SEED_TODOS_WITH_CATEGORIES: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-trabalho',
    titulo: 'Reunião de equipe',
    status: 'pendente',
    categoria_id: 'e2e-cat-trabalho',
    created_at: '2026-06-05T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-pessoal',
    titulo: 'Comprar presente',
    status: 'pendente',
    categoria_id: 'e2e-cat-pessoal',
    created_at: '2026-06-06T10:00:00.000Z',
  }),
]

export const OVERDUE_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-vencida',
    titulo: 'Tarefa vencida',
    status: 'pendente',
    data_prevista: '2020-01-01',
    created_at: '2026-06-07T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-em-dia',
    titulo: 'Tarefa em dia',
    status: 'pendente',
    data_prevista: '2099-12-31',
    created_at: '2026-06-08T10:00:00.000Z',
  }),
]

export const DUE_TODAY_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-hoje',
    titulo: 'Tarefa vence hoje',
    status: 'pendente',
    data_prevista: '2026-07-02',
    created_at: '2026-06-07T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-futura',
    titulo: 'Tarefa futura',
    status: 'pendente',
    data_prevista: '2026-07-10',
    created_at: '2026-06-08T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-vencida-filtro',
    titulo: 'Tarefa vencida filtro',
    status: 'pendente',
    data_prevista: '2026-07-01',
    created_at: '2026-06-09T10:00:00.000Z',
  }),
]

/** Tarefas com títulos e datas distintos para testes de ordenação. */
export const SORTABLE_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-sort-zebra',
    titulo: 'Zebra ordenar',
    status: 'pendente',
    data_prevista: '2026-07-10',
    created_at: '2026-06-01T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-sort-abacaxi',
    titulo: 'Abacaxi ordenar',
    status: 'pendente',
    data_prevista: '2026-07-05',
    created_at: '2026-06-02T10:00:00.000Z',
  }),
]

/** Tarefas vencidas com títulos e datas distintos para ordenação na seção VENCIDAS. */
export const SORTABLE_OVERDUE_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-overdue-zebra',
    titulo: 'Zebra vencida',
    status: 'pendente',
    data_prevista: '2020-01-15',
    created_at: '2026-06-01T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-overdue-abacaxi',
    titulo: 'Abacaxi vencida',
    status: 'pendente',
    data_prevista: '2020-01-01',
    created_at: '2026-06-02T10:00:00.000Z',
  }),
]

/** Tarefas que vencem hoje com títulos e prioridades distintos para ordenação na seção VENCE HOJE. */
export const SORTABLE_DUE_TODAY_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-hoje-zebra',
    titulo: 'Zebra hoje',
    status: 'pendente',
    prioridade: 'baixa',
    data_prevista: '2026-07-02',
    created_at: '2026-06-01T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-hoje-abacaxi',
    titulo: 'Abacaxi hoje',
    status: 'pendente',
    prioridade: 'alta',
    data_prevista: '2026-07-02',
    created_at: '2026-06-02T10:00:00.000Z',
  }),
]

/** Tarefas em andamento com e sem atraso para contadores da sidebar. */
export const OVERDUE_EM_ANDAMENTO_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-andamento-vencida',
    titulo: 'Tarefa em andamento vencida',
    status: 'em_andamento',
    data_prevista: '2020-01-01',
    created_at: '2026-06-07T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-andamento-em-dia',
    titulo: 'Tarefa em andamento em dia',
    status: 'em_andamento',
    data_prevista: '2099-12-31',
    created_at: '2026-06-08T10:00:00.000Z',
  }),
]

export const CANCELLED_TODOS: MockTodo[] = [
  baseTodo({
    id: 'e2e-todo-cancelada',
    titulo: 'Tarefa cancelada',
    status: 'cancelada',
    created_at: '2026-06-09T10:00:00.000Z',
  }),
  baseTodo({
    id: 'e2e-todo-ativa',
    titulo: 'Tarefa ativa',
    status: 'pendente',
    created_at: '2026-06-10T10:00:00.000Z',
  }),
]
