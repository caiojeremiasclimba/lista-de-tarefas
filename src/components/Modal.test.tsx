import { fireEvent, render, screen } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
  it('não renderiza quando fechado', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Conteúdo</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza diálogo acessível quando aberto', () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabelledBy="modal-title">
        <h2 id="modal-title">Título do modal</h2>
        <button type="button">Ação</button>
      </Modal>
    )

    const dialog = screen.getByRole('dialog', { name: 'Título do modal' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('fecha com Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} ariaLabel="Fechar">
        <button type="button">Ação</button>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('fecha ao clicar no overlay', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} ariaLabel="Fechar">
        <p>Conteúdo</p>
      </Modal>
    )

    const overlay = container.firstElementChild as HTMLElement
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('não fecha ao clicar no painel', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} ariaLabel="Fechar">
        <p>Conteúdo do painel</p>
      </Modal>
    )

    fireEvent.click(screen.getByText('Conteúdo do painel'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('move o foco para o primeiro elemento focável ao abrir', () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabelledBy="modal-title">
        <h2 id="modal-title">Título</h2>
        <input aria-label="Campo" />
        <button type="button">Salvar</button>
      </Modal>
    )

    expect(screen.getByLabelText('Campo')).toHaveFocus()
  })

  it('bloqueia scroll do main enquanto aberto', () => {
    const main = document.createElement('main')
    document.body.appendChild(main)

    const { unmount } = render(
      <Modal open onClose={vi.fn()} ariaLabel="Teste">
        <p>Conteúdo</p>
      </Modal>
    )

    expect(main.style.overflow).toBe('hidden')

    unmount()

    expect(main.style.overflow).toBe('')
    document.body.removeChild(main)
  })
})
