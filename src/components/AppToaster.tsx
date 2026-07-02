import { Toaster } from 'sonner'

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-slate-200 bg-white text-slate-800 shadow-lg',
          title: 'text-sm font-medium',
          description: 'text-sm text-slate-600',
          success: 'border-green-200',
          error: 'border-red-200',
          closeButton:
            'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700',
        },
      }}
    />
  )
}
