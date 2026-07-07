import { fireEvent, render, screen } from '@testing-library/react'
import { THEME_PREFS_KEY } from '../lib/themePreferences'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeProbe() {
  const { theme, setTheme, toggleTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        set-dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        set-light
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('inicia com tema claro por padrão', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('restaura preferência salva ao montar', () => {
    localStorage.setItem(THEME_PREFS_KEY, 'dark')

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('ignora preferência inválida e usa tema claro', () => {
    localStorage.setItem(THEME_PREFS_KEY, 'sepia')

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('aplica e persiste tema via setTheme', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'set-dark' }))

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_PREFS_KEY)).toBe('dark')
  })

  it('alterna tema via toggleTheme', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem(THEME_PREFS_KEY)).toBe('light')
  })

  it('lança erro quando useTheme é usado fora do provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ThemeProbe />)).toThrow(/ThemeProvider/)

    consoleSpy.mockRestore()
  })
})
