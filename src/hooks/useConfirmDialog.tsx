import { useCallback, useRef, useState, type ReactElement } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

export interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

interface DialogState {
  open: boolean
  options: ConfirmOptions
  loading: boolean
}

export function useConfirmDialog() {
  const [state, setState] = useState<DialogState | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({ open: true, options, loading: false })
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    setState(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }, [])

  let confirmDialog: ReactElement | null = null
  if (state) {
    confirmDialog = (
      <ConfirmDialog
        open={state.open}
        title={state.options.title}
        description={state.options.description}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        variant={state.options.variant}
        loading={state.loading}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    )
  }

  return { confirm, confirmDialog }
}
