import { fireEvent, render, screen } from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('não renderiza quando fechado', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Excluir"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título e descrição quando aberto', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir tarefa"
        description="Deseja excluir esta tarefa?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog', { name: 'Excluir tarefa' })).toBeInTheDocument()
    expect(screen.getByText('Deseja excluir esta tarefa?')).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar no botão de confirmação', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Tem certeza?"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar em Cancelar', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel com Escape', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('foca no botão Cancelar ao abrir', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
  })

  it('desabilita botões quando loading', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir"
        description="Tem certeza?"
        confirmLabel="Excluir"
        loading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Aguarde...' })).toBeDisabled()
  })
})
