import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeProvider'
import ThemeToggle from './ThemeToggle'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('exibe controle para ativar modo escuro no tema claro', () => {
    renderWithTheme(<ThemeToggle showLabel />)
    expect(screen.getByRole('button', { name: 'Ativar modo escuro' })).toBeInTheDocument()
    expect(screen.getByText('Modo escuro')).toBeInTheDocument()
  })

  it('alterna para modo escuro ao clicar', () => {
    renderWithTheme(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))

    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('lista-tarefas:theme')).toBe('dark')
  })

  it('alterna de volta para modo claro ao clicar novamente', () => {
    localStorage.setItem('lista-tarefas:theme', 'dark')
    document.documentElement.classList.add('dark')

    renderWithTheme(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo claro' }))

    expect(screen.getByRole('button', { name: 'Ativar modo escuro' })).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(localStorage.getItem('lista-tarefas:theme')).toBe('light')
  })
})
