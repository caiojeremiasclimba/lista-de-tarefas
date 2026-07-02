import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LoginForm from './LoginForm'

const mockSignIn = vi.hoisted(() => vi.fn())
const mockResetPassword = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      resetPasswordForEmail: mockResetPassword,
    },
  },
}))

vi.mock('../lib/authPreferences', () => ({
  getRememberedEmail: vi.fn(() => 'salvo@example.com'),
  getRememberMePreference: vi.fn(() => true),
  migrateSessionStorage: vi.fn(),
  setRememberedEmail: vi.fn(),
  setRememberMePreference: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue({ error: null })
    mockResetPassword.mockResolvedValue({ error: null })

    const authPrefs = await import('../lib/authPreferences')
    vi.mocked(authPrefs.getRememberedEmail).mockReturnValue('salvo@example.com')
    vi.mocked(authPrefs.getRememberMePreference).mockReturnValue(true)
  })

  it('preenche e-mail lembrado ao montar', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('E-mail')).toHaveValue('salvo@example.com')
  })

  it('exibe erro quando login falha', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('exibe mensagem amigável para e-mail não confirmado', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Email not confirmed' } })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(
      await screen.findByText(/e-mail ainda não confirmado/i)
    ).toBeInTheDocument()
  })

  it('exibe sucesso após login', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(
      await screen.findByText(/login realizado com sucesso/i)
    ).toBeInTheDocument()
  })

  it('exige e-mail para recuperação de senha', async () => {
    const { getRememberedEmail } = await import('../lib/authPreferences')
    vi.mocked(getRememberedEmail).mockReturnValue(null)

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: /esqueceu sua senha/i }))

    expect(
      await screen.findByText(/informe seu e-mail para recuperar/i)
    ).toBeInTheDocument()
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('envia e-mail de recuperação de senha', async () => {
    render(<LoginForm />)

    fireEvent.click(screen.getByRole('button', { name: /esqueceu sua senha/i }))

    await waitFor(() => expect(mockResetPassword).toHaveBeenCalled())

    expect(mockResetPassword).toHaveBeenCalledWith(
      'salvo@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/') })
    )
    expect(
      await screen.findByText(/enviaremos um link de recuperação/i)
    ).toBeInTheDocument()
  })

  it('alterna visibilidade da senha', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Senha')
    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: /mostrar senha/i }))

    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
