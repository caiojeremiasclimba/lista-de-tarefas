import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeProvider'
import AppToaster from './AppToaster'

vi.mock('sonner', () => ({
  Toaster: ({ theme }: { theme: string }) => (
    <div data-testid="toaster" data-theme={theme} />
  ),
}))

function renderWithTheme(initialTheme?: 'light' | 'dark') {
  if (initialTheme) {
    localStorage.setItem('lista-tarefas:theme', initialTheme)
  }

  return render(
    <ThemeProvider>
      <AppToaster />
    </ThemeProvider>
  )
}

describe('AppToaster', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('usa tema claro por padrão', () => {
    renderWithTheme()
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-theme', 'light')
  })

  it('usa tema escuro quando preferência está salva', () => {
    renderWithTheme('dark')
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-theme', 'dark')
  })
})
