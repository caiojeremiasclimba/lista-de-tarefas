import { useEffect, useId, useRef, type ReactNode } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  ariaLabelledBy?: string
  ariaLabel?: string
  panelClassName?: string
  overlayClassName?: string
  children: ReactNode
}

export default function Modal({
  open,
  onClose,
  ariaLabelledBy,
  ariaLabel,
  panelClassName = '',
  overlayClassName = '',
  children,
}: ModalProps) {
  const fallbackTitleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : fallbackTitleId)

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const main = document.querySelector('main')
    const previousMainOverflow = main?.style.overflow
    if (main) main.style.overflow = 'hidden'

    const panel = panelRef.current
    if (panel) {
      const focusable = getFocusableElements(panel)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        panel.focus()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = getFocusableElements(panelRef.current)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (main) main.style.overflow = previousMainOverflow ?? ''

      const previous = previouslyFocusedRef.current
      if (previous?.isConnected) {
        previous.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center md:inset-y-0 md:left-56 md:right-0 ${overlayClassName}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`rounded-2xl bg-white p-6 shadow-xl outline-none ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
