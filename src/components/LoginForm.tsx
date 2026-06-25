import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { supabase } from '../lib/supabase'
import {
  AuthAlert,
  AuthField,
  AuthSubmitButton,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from './AuthUi'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function getLoginErrorMessage(message: string) {
    const lower = message.toLowerCase()
    if (lower.includes('email not confirmed')) {
      return 'E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.'
    }
    return message
  }

  async function handleForgotPassword() {
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Informe seu e-mail para recuperar a senha.')
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess('Enviamos um link de recuperação para seu e-mail.')
    }
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(getLoginErrorMessage(authError.message))
    } else {
      setSuccess('Login realizado com sucesso! Redirecionando...')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField
        id="login-email"
        label="E-mail"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="seu@email.com"
        icon={<MailIcon />}
      />

      <AuthField
        id="login-password"
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={setPassword}
        placeholder="Mínimo 6 caracteres"
        icon={<LockIcon />}
        minLength={6}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Lembrar-me
        </label>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Esqueceu sua senha?
        </button>
      </div>

      {error && <AuthAlert type="error">{error}</AuthAlert>}
      {success && <AuthAlert type="success">{success}</AuthAlert>}

      <AuthSubmitButton loading={loading} loadingText="Entrando...">
        Entrar
      </AuthSubmitButton>
    </form>
  )
}
