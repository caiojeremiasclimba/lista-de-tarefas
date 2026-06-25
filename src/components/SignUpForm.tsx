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

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else if (data.session) {
      setSuccess('Conta criada com sucesso! Você já está logado.')
      setEmail('')
      setPassword('')
    } else {
      setSuccess(
        'Conta criada! Enviamos um link de confirmação para seu e-mail. ' +
          'Valide o e-mail e depois faça login na aba Login.'
      )
      setEmail('')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField
        id="signup-email"
        label="E-mail"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="seu@email.com"
        icon={<MailIcon />}
      />

      <AuthField
        id="signup-password"
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

      {error && <AuthAlert type="error">{error}</AuthAlert>}
      {success && <AuthAlert type="success">{success}</AuthAlert>}

      <AuthSubmitButton loading={loading} loadingText="Criando conta...">
        Criar conta
      </AuthSubmitButton>
    </form>
  )
}
