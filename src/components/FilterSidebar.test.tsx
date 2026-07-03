import { fireEvent, render, screen } from '@testing-library/react'
import { makeCategoria } from '../test/fixtures/todos'
import FilterSidebar, { type FiltroCounts } from './FilterSidebar'

const defaultCounts: FiltroCounts = {
  todas: 10,
  pendente: 3,
  em_andamento: 2,
  concluida: 4,
  cancelada: 1,
  vencidas: 2,
}

function renderSidebar(overrides: Partial<Parameters<typeof FilterSidebar>[0]> = {}) {
  const onViewChange = vi.fn()
  const onChange = vi.fn()
  const onCategoriaChange = vi.fn()
  const onPrioridadeChange = vi.fn()
  const onNovaCategoria = vi.fn()
  const onEditCategoria = vi.fn()
  const onDeleteCategoria = vi.fn()

  render(
    <FilterSidebar
      view="tarefas"
      onViewChange={onViewChange}
      active="todas"
      onChange={onChange}
      counts={defaultCounts}
      categorias={[makeCategoria({ id: 'cat-1', nome: 'Trabalho' })]}
      categoriaAtiva={null}
      countsPorCategoria={{ 'cat-1': 5 }}
      onCategoriaChange={onCategoriaChange}
      prioridadeAtiva={null}
      countsPorPrioridade={{ alta: 2, media: 5, baixa: 3 }}
      onPrioridadeChange={onPrioridadeChange}
      onNovaCategoria={onNovaCategoria}
      onEditCategoria={onEditCategoria}
      onDeleteCategoria={onDeleteCategoria}
      {...overrides}
    />
  )

  return {
    onViewChange,
    onChange,
    onCategoriaChange,
    onPrioridadeChange,
    onNovaCategoria,
    onEditCategoria,
    onDeleteCategoria,
  }
}

describe('FilterSidebar', () => {
  it('renderiza navegação e filtros', () => {
    renderSidebar()

    expect(screen.getByRole('navigation', { name: /navegação e filtros/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument()
  })

  it('chama onViewChange ao clicar em Dashboard', () => {
    const { onViewChange } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))

    expect(onViewChange).toHaveBeenCalledWith('dashboard')
  })

  it('chama onChange ao selecionar filtro de vencidas', () => {
    const { onChange } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /vencidas/i }))

    expect(onChange).toHaveBeenCalledWith('vencidas')
  })

  it('expande status e chama onChange ao selecionar pendentes', () => {
    const { onChange } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /por status/i }))
    fireEvent.click(screen.getByRole('button', { name: /pendentes/i }))

    expect(onChange).toHaveBeenCalledWith('pendente')
  })

  it('chama onNovaCategoria ao clicar em nova categoria', () => {
    const { onNovaCategoria } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /por categoria/i }))
    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(onNovaCategoria).toHaveBeenCalled()
  })

  it('chama onCategoriaChange ao selecionar categoria', () => {
    const { onCategoriaChange } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /por categoria/i }))
    const [categoryButton] = screen.getAllByRole('button', { name: /trabalho/i })
    fireEvent.click(categoryButton)

    expect(onCategoriaChange).toHaveBeenCalledWith('cat-1')
  })

  it('expande prioridade e chama onPrioridadeChange ao selecionar alta', () => {
    const { onPrioridadeChange } = renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /por prioridade/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Alta/i }))

    expect(onPrioridadeChange).toHaveBeenCalledWith('alta')
  })

  it('desativa filtros visualmente no dashboard', () => {
    renderSidebar({ view: 'dashboard' })

    expect(screen.getByText(/aplicam-se à visão tarefas/i)).toBeInTheDocument()
  })

  it('exibe mensagem quando não há categorias', () => {
    renderSidebar({ categorias: [] })

    fireEvent.click(screen.getByRole('button', { name: /por categoria/i }))

    expect(screen.getByText(/nenhuma categoria ainda/i)).toBeInTheDocument()
  })
})
