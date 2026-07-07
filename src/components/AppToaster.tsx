import { Toaster } from 'sonner'
import { useTheme } from '../contexts/ThemeProvider'

export default function AppToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border border-slate-200 bg-white text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
          title: 'text-sm font-medium',
          description: 'text-sm text-slate-600 dark:text-slate-300',
          success: 'border-green-200 dark:border-green-900',
          error: 'border-red-200 dark:border-red-900',
          closeButton:
            'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100',
        },
      }}
    />
  )
}
