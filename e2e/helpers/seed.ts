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

function baseCategoria(overrides: Pick<MockCategoria, 'id' | 'nome'>): MockCategoria {
  return {
    user_id: E2E_USER.id,
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
  baseCategoria({ id: 'e2e-cat-trabalho', nome: 'Trabalho' }),
  baseCategoria({ id: 'e2e-cat-pessoal', nome: 'Pessoal' }),
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
