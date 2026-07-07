import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { clearRecoveryCallbackFromUrl } from '../lib/authPreferences'
import { supabase } from '../lib/supabase'
import {
  AuthAlert,
  AuthField,
  AuthSubmitButton,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from './AuthUi'
import ThemeToggle from './ThemeToggle'

interface ResetPasswordFormProps {
  onSuccess: () => void
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
    } else {
      clearRecoveryCallbackFromUrl()
      setSuccess('Senha atualizada com sucesso! Redirecionando...')
      setTimeout(onSuccess, 1500)
    }

    setLoading(false)
  }

  const passwordToggle = (visible: boolean, onToggle: () => void, label: string) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      aria-label={label}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 shadow-xl shadow-blue-900/10 dark:bg-slate-800 dark:shadow-black/40">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
          <ClipboardIcon />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800 dark:text-slate-100">Nova senha</h1>
        <p className="mb-8 mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Defina uma nova senha para acessar sua conta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="reset-password"
            label="Nova senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 6 caracteres"
            icon={<LockIcon />}
            minLength={6}
            rightSlot={passwordToggle(
              showPassword,
              () => setShowPassword((prev) => !prev),
              showPassword ? 'Ocultar senha' : 'Mostrar senha'
            )}
          />

          <AuthField
            id="reset-confirm-password"
            label="Confirmar senha"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repita a nova senha"
            icon={<LockIcon />}
            minLength={6}
            rightSlot={passwordToggle(
              showConfirmPassword,
              () => setShowConfirmPassword((prev) => !prev),
              showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'
            )}
          />

          {error && <AuthAlert type="error">{error}</AuthAlert>}
          {success && <AuthAlert type="success">{success}</AuthAlert>}

          <AuthSubmitButton loading={loading} loadingText="Salvando...">
            Salvar nova senha
          </AuthSubmitButton>
        </form>
      </div>
    </div>
  )
}
