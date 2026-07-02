import { fireEvent, render, screen } from '@testing-library/react'
import { makeCategoria } from '../test/fixtures/todos'
import TaskModals from './todos/TaskModals'

describe('TaskModals', () => {
  const categorias = [makeCategoria({ id: 'cat-1', nome: 'Trabalho' })]

  const baseProps = {
    showForm: false,
    showCategoriaForm: false,
    editingTodo: null,
    editingCategoria: null,
    newTaskCategoriaId: null,
    categorias,
    onCloseForm: vi.fn(),
    onCloseCategoriaForm: vi.fn(),
    onSubmitTodo: vi.fn(),
    onSubmitCategoria: vi.fn(),
  }

  it('abre modal de tarefa com diálogo acessível', () => {
    render(<TaskModals {...baseProps} showForm />)

    expect(screen.getByRole('dialog', { name: 'Nova tarefa' })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toHaveFocus()
  })

  it('abre modal de categoria com diálogo acessível', () => {
    render(<TaskModals {...baseProps} showCategoriaForm />)

    expect(screen.getByRole('dialog', { name: 'Nova categoria' })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toHaveFocus()
  })

  it('fecha modal de tarefa com Escape', () => {
    const onCloseForm = vi.fn()
    render(<TaskModals {...baseProps} showForm onCloseForm={onCloseForm} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCloseForm).toHaveBeenCalledTimes(1)
  })

  it('fecha modal de categoria com Escape', () => {
    const onCloseCategoriaForm = vi.fn()
    render(
      <TaskModals {...baseProps} showCategoriaForm onCloseCategoriaForm={onCloseCategoriaForm} />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCloseCategoriaForm).toHaveBeenCalledTimes(1)
  })
})
