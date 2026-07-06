import { TODO_STATUSES } from '../constants/todoStatus'
import { makeCategoria, makeSubtarefa, makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import type { Todo, TodoStatus } from '../types/todo'
import { computeTodoFilters, getListaVaziaMensagem, getTarefasVisiveis } from './todoFilters'

const categorias = [
  makeCategoria({ id: 'cat-1', nome: 'Trabalho' }),
  makeCategoria({ id: 'cat-2', nome: 'Pessoal' }),
]

function buildFixtureTodos(): Todo[] {
  return [
    makeTodo({
      id: 'pendente-ok',
      titulo: 'Revisar código',
      descricao: 'Pull request aberto',
      status: 'pendente',
      categoria_id: 'cat-1',
      data_prevista: '2026-07-10',
    }),
    makeTodo({
      id: 'pendente-vencida',
      titulo: 'Enviar relatório',
      status: 'pendente',
      categoria_id: 'cat-1',
      data_prevista: '2026-07-01',
    }),
    makeTodo({
      id: 'em-andamento',
      titulo: 'Implementar filtros',
      descricao: 'Busca e categorias',
      status: 'em_andamento',
      categoria_id: 'cat-2',
      data_prevista: '2026-07-15',
    }),
    makeTodo({
      id: 'concluida',
      titulo: 'Deploy produção',
      status: 'concluida',
      categoria_id: 'cat-2',
      created_at: '2026-06-01T00:00:00.000Z',
      completed_at: '2026-06-02T00:00:00.000Z',
    }),
    makeTodo({
      id: 'cancelada',
      titulo: 'Reunião cancelada',
      status: 'cancelada',
      categoria_id: null,
      data_prevista: '2026-06-01',
    }),
    makeTodo({
      id: 'pendente-hoje',
      titulo: 'Ligar para cliente',
      status: 'pendente',
      categoria_id: 'cat-1',
      data_prevista: '2026-07-02',
    }),
    makeTodo({
      id: 'com-subtarefa',
      titulo: 'Projeto alpha',
      descricao: null,
      status: 'pendente',
      categoria_id: 'cat-1',
      subtarefas: [makeSubtarefa({ id: 'sub-1', titulo: 'documentação interna' })],
    }),
  ]
}

function emptyPorStatus(): Record<TodoStatus, Todo[]> {
  return {
    pendente: [],
    em_andamento: [],
    concluida: [],
    cancelada: [],
  }
}

describe('getTarefasVisiveis', () => {
  const filtrados = [makeTodo({ id: 'a' }), makeTodo({ id: 'b' })]
  const porStatus = {
    ...emptyPorStatus(),
    pendente: [makeTodo({ id: 'p1' })],
  }
  const vencidas = [makeTodo({ id: 'v1' })]
  const venceHoje = [makeTodo({ id: 'h1' })]

  it('retorna filtradosPorBusca quando filtroAtivo é todas', () => {
    expect(getTarefasVisiveis('todas', filtrados, porStatus, vencidas, venceHoje)).toEqual(
      filtrados
    )
  })

  it('retorna vencidas quando filtroAtivo é vencidas', () => {
    expect(getTarefasVisiveis('vencidas', filtrados, porStatus, vencidas, venceHoje)).toEqual(
      vencidas
    )
  })

  it('retorna venceHoje quando filtroAtivo é vence_hoje', () => {
    expect(getTarefasVisiveis('vence_hoje', filtrados, porStatus, vencidas, venceHoje)).toEqual(
      venceHoje
    )
  })

  it('retorna porStatus do filtro quando filtroAtivo é um status', () => {
    expect(getTarefasVisiveis('pendente', filtrados, porStatus, vencidas, venceHoje)).toEqual(
      porStatus.pendente
    )
  })
})

describe('computeTodoFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sem filtros retorna todas as tarefas e contadores corretos', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.counts.todas).toBe(7)
    expect(result.tarefasVisiveis).toHaveLength(7)
    expect(result.secoesVisiveis).toEqual(TODO_STATUSES)
    expect(result.categoriaAtivaNome).toBeNull()
  })

  it('filtra por busca no título', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: 'relatório',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.filtradosPorBusca.map((t) => t.id)).toEqual(['pendente-vencida'])
    expect(result.counts.todas).toBe(1)
  })

  it('filtra por busca na descrição', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: 'pull request',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.filtradosPorBusca.map((t) => t.id)).toEqual(['pendente-ok'])
  })

  it('filtra por busca em subtarefa', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: 'documentação',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.filtradosPorBusca.map((t) => t.id)).toEqual(['com-subtarefa'])
  })

  it('filtra por categoria e ajusta contadores', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: 'cat-1',
      filtroPrioridade: null,
    })

    expect(result.filtradosPorBusca.map((t) => t.id).sort()).toEqual(
      ['com-subtarefa', 'pendente-hoje', 'pendente-ok', 'pendente-vencida'].sort()
    )
    expect(result.counts.todas).toBe(4)
    expect(result.categoriaAtivaNome).toBe('Trabalho')
  })

  it('agrupa tarefas por status', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.porStatus.pendente.map((t) => t.id).sort()).toEqual(
      ['com-subtarefa', 'pendente-hoje', 'pendente-ok', 'pendente-vencida'].sort()
    )
    expect(result.porStatus.em_andamento.map((t) => t.id)).toEqual(['em-andamento'])
    expect(result.porStatus.concluida.map((t) => t.id)).toEqual(['concluida'])
    expect(result.porStatus.cancelada.map((t) => t.id)).toEqual(['cancelada'])
  })

  it('calcula contadores por status e vencidas', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.counts).toMatchObject({
      todas: 7,
      pendente: 4,
      em_andamento: 1,
      concluida: 1,
      cancelada: 1,
      vencidas: 1,
      vence_hoje: 1,
    })
    expect(result.vencidas.map((t) => t.id)).toEqual(['pendente-vencida'])
    expect(result.venceHoje.map((t) => t.id)).toEqual(['pendente-hoje'])
  })

  it('calcula countsPorCategoria com base na busca', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.countsPorCategoria).toEqual({
      'cat-1': 4,
      'cat-2': 2,
    })
  })

  it('expõe categoriasPorId', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.categoriasPorId).toEqual({
      'cat-1': { nome: 'Trabalho', cor: 'slate' },
      'cat-2': { nome: 'Pessoal', cor: 'slate' },
    })
  })

  it('define secoesVisiveis conforme filtroAtivo', () => {
    const todos = buildFixtureTodos()
    const base = { todos, categorias, busca: '', filtroCategoria: null, filtroPrioridade: null }

    expect(computeTodoFilters({ ...base, filtroAtivo: 'todas' }).secoesVisiveis).toEqual(
      TODO_STATUSES
    )
    expect(computeTodoFilters({ ...base, filtroAtivo: 'vencidas' }).secoesVisiveis).toEqual([])
    expect(computeTodoFilters({ ...base, filtroAtivo: 'vence_hoje' }).secoesVisiveis).toEqual([])
    expect(computeTodoFilters({ ...base, filtroAtivo: 'pendente' }).secoesVisiveis).toEqual([
      'pendente',
    ])
  })

  it('retorna tarefasVisiveis de vence hoje quando filtroAtivo é vence_hoje', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'vence_hoje',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.tarefasVisiveis.map((t) => t.id)).toEqual(['pendente-hoje'])
  })

  it('retorna tarefasVisiveis do status quando filtroAtivo é específico', () => {
    const todos = buildFixtureTodos()
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'em_andamento',
      filtroCategoria: null,
      filtroPrioridade: null,
    })

    expect(result.tarefasVisiveis.map((t) => t.id)).toEqual(['em-andamento'])
  })

  it('filtra por prioridade alta', () => {
    const todos = [
      makeTodo({ id: 'alta', titulo: 'Urgente', prioridade: 'alta' }),
      makeTodo({ id: 'baixa', titulo: 'Depois', prioridade: 'baixa' }),
    ]
    const result = computeTodoFilters({
      todos,
      categorias,
      busca: '',
      filtroAtivo: 'todas',
      filtroCategoria: null,
      filtroPrioridade: 'alta',
    })

    expect(result.tarefasVisiveis.map((t) => t.id)).toEqual(['alta'])
    expect(result.countsPorPrioridade).toEqual({ alta: 1, media: 0, baixa: 1 })
    expect(result.prioridadeAtivaLabel).toBe('Alta')
  })
})

describe('getListaVaziaMensagem', () => {
  it('combina busca, categoria e filtro de status', () => {
    expect(getListaVaziaMensagem('teste', 'Trabalho', 5, 'pendente')).toBe(
      'Nenhum resultado para "teste" em Pendente ("Trabalho")'
    )
  })

  it('combina busca e categoria', () => {
    expect(getListaVaziaMensagem('teste', 'Trabalho', 5)).toBe(
      'Nenhum resultado para "teste" em "Trabalho"'
    )
  })

  it('combina busca e filtro vence hoje', () => {
    expect(getListaVaziaMensagem('teste', null, 5, 'vence_hoje')).toBe(
      'Nenhum resultado para "teste" em Vence hoje'
    )
  })

  it('combina busca e filtro de status', () => {
    expect(getListaVaziaMensagem('teste', null, 5, 'vencidas')).toBe(
      'Nenhum resultado para "teste" em Vencidas'
    )
  })

  it('retorna mensagem só com busca', () => {
    expect(getListaVaziaMensagem('teste', null, 5)).toBe('Nenhum resultado para "teste"')
  })

  it('combina categoria e filtro sem busca', () => {
    expect(getListaVaziaMensagem('', 'Trabalho', 5, 'concluida')).toBe(
      'Nenhuma tarefa concluída em "Trabalho"'
    )
  })

  it('retorna mensagem só com categoria', () => {
    expect(getListaVaziaMensagem('', 'Trabalho', 5)).toBe('Nenhuma tarefa em "Trabalho"')
  })

  it('retorna mensagem só com filtro vence hoje', () => {
    expect(getListaVaziaMensagem('', null, 5, 'vence_hoje')).toBe('Nenhuma tarefa que vence hoje')
  })

  it('retorna mensagem só com filtro de status', () => {
    expect(getListaVaziaMensagem('', null, 5, 'pendente')).toBe('Nenhuma tarefa pendente')
  })

  it('retorna mensagem de lista vazia inicial', () => {
    expect(getListaVaziaMensagem('', null, 0)).toBe(
      'Nenhuma tarefa ainda. Toque em "Nova tarefa" para começar.'
    )
  })

  it('retorna fallback genérico', () => {
    expect(getListaVaziaMensagem('', null, 5)).toBe('Nenhuma tarefa encontrada.')
  })

  it('retorna mensagem só com filtro de prioridade', () => {
    expect(getListaVaziaMensagem('', null, 5, 'todas', 'Alta')).toBe(
      'Nenhuma tarefa com prioridade alta'
    )
  })
})
