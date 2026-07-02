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
      makeTodo({ id: '1', status: 'concluida', completed_at: '2026-07-01T12:00:00.000Z' }),
      makeTodo({ id: '2', status: 'pendente' }),
      makeTodo({ id: '3', status: 'em_andamento' }),
      makeTodo({ id: '4', status: 'cancelada' }),
    ]

    render(<ProductivityDashboard todos={todos} />)

    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText(/1 de 3 tarefas/i)).toBeInTheDocument()
    expect(screen.getByText(/concluídas na semana/i)).toBeInTheDocument()
    expect(screen.getByText(/distribuição por status/i)).toBeInTheDocument()
  })
})
