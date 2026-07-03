import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { makeCategoria, makeTodo } from '../test/fixtures/todos'
import TodoForm from './TodoForm'

describe('TodoForm', () => {
  const categorias = [makeCategoria({ id: 'cat-1', nome: 'Trabalho' })]

  it('renderiza título de nova tarefa', () => {
    render(<TodoForm categorias={categorias} onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Nova tarefa' })).toBeInTheDocument()
  })

  it('renderiza título de edição quando editingTodo é informado', () => {
    render(
      <TodoForm
        categorias={categorias}
        editingTodo={makeTodo({ titulo: 'Tarefa existente' })}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Editar tarefa' })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toHaveValue('Tarefa existente')
  })

  it('exibe erro de validação quando título está vazio', async () => {
    const onSubmit = vi.fn()
    render(<TodoForm categorias={categorias} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    expect(await screen.findByText('O título é obrigatório')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('chama onSubmit com dados válidos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm categorias={categorias} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Estudar testes' },
    })
    fireEvent.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      titulo: 'Estudar testes',
      status: 'pendente',
      prioridade: 'media',
    })
  })

  it('exibe campos de recorrência ao ativar repetição', () => {
    render(<TodoForm categorias={categorias} onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByLabelText(/repetir tarefa/i))

    expect(screen.getByLabelText(/frequência/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/intervalo/i)).toHaveValue(1)
    expect(screen.getByLabelText(/repetir até/i)).toBeInTheDocument()
  })

  it('envia dados de recorrência no submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm categorias={categorias} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Pagar aluguel' },
    })
    fireEvent.change(screen.getByLabelText(/data prevista/i), {
      target: { value: '2026-07-05' },
    })
    fireEvent.click(screen.getByLabelText(/repetir tarefa/i))
    fireEvent.change(screen.getByLabelText(/frequência/i), {
      target: { value: 'mensal' },
    })
    fireEvent.change(screen.getByLabelText(/intervalo/i), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByLabelText(/repetir até/i), {
      target: { value: '2026-12-31' },
    })
    fireEvent.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      recorrencia_tipo: 'mensal',
      recorrencia_intervalo: 2,
      recorrencia_fim: '2026-12-31',
    })
  })

  it('carrega dados de recorrência na edição', () => {
    render(
      <TodoForm
        categorias={categorias}
        editingTodo={makeTodo({
          recorrencia_tipo: 'mensal',
          recorrencia_intervalo: 2,
          recorrencia_fim: '2026-12-31',
        })}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/repetir tarefa/i)).toBeChecked()
    expect(screen.getByLabelText(/frequência/i)).toHaveValue('mensal')
    expect(screen.getByLabelText(/intervalo/i)).toHaveValue(2)
    expect(screen.getByLabelText(/repetir até/i)).toHaveValue('2026-12-31')
  })

  it('aplica defaultCategoriaId em nova tarefa', () => {
    render(<TodoForm categorias={categorias} defaultCategoriaId="cat-1" onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/categoria/i)).toHaveValue('cat-1')
  })

  it('chama onClose ao cancelar', () => {
    const onClose = vi.fn()
    render(<TodoForm categorias={categorias} onSubmit={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('exibe erro de submit quando onSubmit falha', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Falha ao salvar'))
    render(<TodoForm categorias={categorias} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Tarefa com erro' },
    })
    fireEvent.click(screen.getByRole('button', { name: /adicionar tarefa/i }))

    expect(await screen.findByText('Falha ao salvar')).toBeInTheDocument()
  })
})
