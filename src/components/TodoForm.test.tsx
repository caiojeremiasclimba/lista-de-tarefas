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
    })
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
