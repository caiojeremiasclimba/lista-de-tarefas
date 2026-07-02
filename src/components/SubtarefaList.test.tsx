import { fireEvent, render, screen } from '@testing-library/react'
import { makeSubtarefa } from '../test/fixtures/todos'
import { createSubtarefaDraft } from '../types/subtarefa'
import SubtarefaList from './SubtarefaList'

describe('SubtarefaList', () => {
  describe('modo readonly', () => {
    it('não renderiza quando a lista está vazia', () => {
      const { container } = render(
        <SubtarefaList mode="readonly" subtarefas={[]} onToggle={vi.fn()} />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('chama onToggle ao marcar subtarefa', () => {
      const sub = makeSubtarefa({ id: 'sub-1', titulo: 'Ler documentação', concluida: false })
      const onToggle = vi.fn()

      render(<SubtarefaList mode="readonly" subtarefas={[sub]} onToggle={onToggle} />)

      fireEvent.click(screen.getByRole('button', { name: 'Marcar subtarefa' }))

      expect(onToggle).toHaveBeenCalledWith(sub)
    })

    it('não chama onToggle quando disabled', () => {
      const sub = makeSubtarefa({ id: 'sub-1', concluida: false })
      const onToggle = vi.fn()

      render(<SubtarefaList mode="readonly" subtarefas={[sub]} disabled onToggle={onToggle} />)

      fireEvent.click(screen.getByRole('button', { name: 'Marcar subtarefa' }))

      expect(onToggle).not.toHaveBeenCalled()
    })
  })

  describe('modo editable', () => {
    it('adiciona subtarefa vazia ao clicar em adicionar', () => {
      const onChange = vi.fn()

      render(<SubtarefaList mode="editable" subtarefas={[]} onChange={onChange} />)

      fireEvent.click(screen.getByRole('button', { name: /adicionar subtarefa/i }))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toHaveLength(1)
      expect(onChange.mock.calls[0][0][0]).toMatchObject({
        titulo: '',
        concluida: false,
      })
    })

    it('remove subtarefa ao clicar em remover', () => {
      const drafts = [
        createSubtarefaDraft({ clientKey: 'draft-1', titulo: 'Primeira' }),
        createSubtarefaDraft({ clientKey: 'draft-2', titulo: 'Segunda' }),
      ]
      const onChange = vi.fn()

      render(<SubtarefaList mode="editable" subtarefas={drafts} onChange={onChange} />)

      fireEvent.click(screen.getAllByRole('button', { name: 'Remover subtarefa' })[0])

      expect(onChange).toHaveBeenCalledWith([drafts[1]])
    })

    it('atualiza título da subtarefa ao digitar', () => {
      const drafts = [createSubtarefaDraft({ clientKey: 'draft-1', titulo: 'Antes' })]
      const onChange = vi.fn()

      render(<SubtarefaList mode="editable" subtarefas={drafts} onChange={onChange} />)

      fireEvent.change(screen.getByPlaceholderText('Descrição da subtarefa'), {
        target: { value: 'Depois' },
      })

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ titulo: 'Depois', concluida: false }),
      ])
    })

    it('alterna concluida da subtarefa no formulário', () => {
      const drafts = [
        createSubtarefaDraft({ clientKey: 'draft-1', titulo: 'Item', concluida: false }),
      ]
      const onChange = vi.fn()

      render(<SubtarefaList mode="editable" subtarefas={drafts} onChange={onChange} />)

      fireEvent.click(screen.getByRole('button', { name: 'Marcar subtarefa' }))

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ titulo: 'Item', concluida: true }),
      ])
    })
  })
})
