import type { Categoria } from '../../types/categoria'
import type { Subtarefa } from '../../types/subtarefa'
import type { Todo, TodoFormData } from '../../types/todo'

export function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    user_id: 'user-1',
    titulo: 'Tarefa teste',
    descricao: null,
    data_prevista: null,
    status: 'pendente',
    prioridade: 'media',
    categoria_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    completed_at: null,
    recorrencia_tipo: 'nenhuma',
    recorrencia_intervalo: 1,
    recorrencia_fim: null,
    recorrencia_origem_id: null,
    ...overrides,
  }
}

export function makeCategoria(overrides: Partial<Categoria> = {}): Categoria {
  return {
    id: 'cat-1',
    user_id: 'user-1',
    nome: 'Trabalho',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeSubtarefa(overrides: Partial<Subtarefa> = {}): Subtarefa {
  return {
    id: 'sub-1',
    tarefa_id: 'todo-1',
    user_id: 'user-1',
    titulo: 'Subtarefa teste',
    concluida: false,
    ordem: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeTodoFormData(overrides: Partial<TodoFormData> = {}): TodoFormData {
  return {
    titulo: 'Minha tarefa',
    descricao: '',
    data_prevista: '',
    status: 'pendente',
    prioridade: 'media',
    categoria_id: '',
    subtarefas: [],
    recorrencia_tipo: 'nenhuma',
    recorrencia_intervalo: 1,
    recorrencia_fim: '',
    ...overrides,
  }
}

/** Fixed reference date for deterministic overdue/sort tests: 2026-07-02 12:00 local */
export const FIXED_TODAY = new Date(2026, 6, 2, 12, 0, 0)
