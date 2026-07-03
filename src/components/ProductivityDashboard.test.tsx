import { render, screen } from '@testing-library/react'
import { makeTodo, FIXED_TODAY } from '../test/fixtures/todos'
import ProductivityDashboard from './ProductivityDashboard'

describe('ProductivityDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe estado de carregamento', () => {
    render(<ProductivityDashboard todos={[]} loading />)

    expect(screen.getByText(/carregando indicadores/i)).toBeInTheDocument()
  })

  it('exibe dashboard vazio quando não há tarefas', () => {
    render(<ProductivityDashboard todos={[]} />)

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByText(/sem dados/i)).toBeInTheDocument()
    expect(screen.getByText(/nenhuma tarefa ainda/i)).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('exibe métricas com tarefas', () => {
    const todos = [
      makeTodo({
        id: '1',
        status: 'concluida',
        prioridade: 'alta',
        completed_at: '2026-07-01T12:00:00.000Z',
      }),
      makeTodo({ id: '2', status: 'pendente', prioridade: 'media' }),
      makeTodo({ id: '3', status: 'em_andamento', prioridade: 'baixa' }),
      makeTodo({ id: '4', status: 'cancelada', prioridade: 'alta' }),
    ]

    render(<ProductivityDashboard todos={todos} />)

    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText(/1 de 3 tarefas/i)).toBeInTheDocument()
    expect(screen.getByText(/concluídas na semana/i)).toBeInTheDocument()
    expect(screen.getByText(/distribuição por status/i)).toBeInTheDocument()
    expect(screen.getByText('Por prioridade')).toBeInTheDocument()

    const prioridadeList = screen.getByText('Por prioridade').closest('div')!
    expect(prioridadeList).toHaveTextContent('Alta')
    expect(prioridadeList).toHaveTextContent('Média')
    expect(prioridadeList).toHaveTextContent('Baixa')
    expect(prioridadeList.textContent).toMatch(/Alta[\s\S]*2/)
    expect(prioridadeList.textContent).toMatch(/Média[\s\S]*1/)
    expect(prioridadeList.textContent).toMatch(/Baixa[\s\S]*1/)
  })
})
