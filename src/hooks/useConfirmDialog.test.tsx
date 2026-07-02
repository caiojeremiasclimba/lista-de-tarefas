import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { useConfirmDialog, type ConfirmOptions } from './useConfirmDialog'

function TestHarness({
  onReady,
}: {
  onReady: (confirm: (options: ConfirmOptions) => Promise<boolean>) => void
}) {
  const { confirm, confirmDialog } = useConfirmDialog()

  useEffect(() => {
    onReady(confirm)
  }, [confirm, onReady])

  return <>{confirmDialog}</>
}

describe('useConfirmDialog', () => {
  it('resolve true quando usuário confirma', async () => {
    let confirmFn!: (options: ConfirmOptions) => Promise<boolean>

    render(
      <TestHarness
        onReady={(confirm) => {
          confirmFn = confirm
        }}
      />
    )

    let resolved: boolean | undefined
    await act(async () => {
      void confirmFn({
        title: 'Excluir',
        description: 'Tem certeza?',
        confirmLabel: 'Excluir',
      }).then((value) => {
        resolved = value
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    })

    await waitFor(() => {
      expect(resolved).toBe(true)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('resolve false quando usuário cancela', async () => {
    let confirmFn!: (options: ConfirmOptions) => Promise<boolean>

    render(
      <TestHarness
        onReady={(confirm) => {
          confirmFn = confirm
        }}
      />
    )

    let resolved: boolean | undefined
    await act(async () => {
      void confirmFn({
        title: 'Excluir',
        description: 'Tem certeza?',
      }).then((value) => {
        resolved = value
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    })

    await waitFor(() => {
      expect(resolved).toBe(false)
    })
  })

  it('abre dialog com opções fornecidas', async () => {
    let confirmFn!: (options: ConfirmOptions) => Promise<boolean>

    render(
      <TestHarness
        onReady={(confirm) => {
          confirmFn = confirm
        }}
      />
    )

    await act(async () => {
      void confirmFn({
        title: 'Excluir categoria',
        description: 'Deseja excluir esta categoria?',
        confirmLabel: 'Excluir',
        variant: 'danger',
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Excluir categoria' })).toBeInTheDocument()
    })
    expect(screen.getByText('Deseja excluir esta categoria?')).toBeInTheDocument()
  })
})
