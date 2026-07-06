import { useState, useEffect, useRef } from 'react'
import type { SubmitEvent, ChangeEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { removeAvatar, uploadAvatar } from '../utils/avatarStorage'
import {
  fetchPreferenciasLembrete,
  getDefaultTimezone,
  savePreferenciasLembrete,
} from '../services/lembreteService'
import { LEMBRETE_HORARIO_OPCOES } from '../constants/todoLembrete'
import { getUserAvatarUrl, hasEmailPasswordIdentity } from '../utils/userDisplay'
import { AuthAlert, AuthField, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from './AuthUi'
import UserAvatar from './UserAvatar'

interface ProfileScreenProps {
  user: User
}

async function syncAuthSession(): Promise<void> {
  await supabase.auth.refreshSession()
}

function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-slate-400 hover:text-slate-600"
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )
}

export default function ProfileScreen({ user }: ProfileScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [hasAvatar, setHasAvatar] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [removingAvatar, setRemovingAvatar] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [erro, setErro] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  const [lembreteHorario, setLembreteHorario] = useState('08:00')
  const [lembreteTimezone, setLembreteTimezone] = useState(getDefaultTimezone)
  const [savingLembrete, setSavingLembrete] = useState(false)
  const [lembreteError, setLembreteError] = useState<string | null>(null)
  const [lembreteSuccess, setLembreteSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      setError(null)

      const {
        data: { user: currentUser },
        error: fetchError,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (fetchError || !currentUser) {
        setError(fetchError?.message ?? 'Não foi possível carregar o perfil.')
        setLoading(false)
        return
      }

      const fullName = currentUser.user_metadata?.full_name
      setNome(typeof fullName === 'string' ? fullName : '')
      setEmail(currentUser.email ?? '')
      setHasAvatar(Boolean(getUserAvatarUrl(currentUser)))
      setPreviewUrl(null)

      try {
        const prefs = await fetchPreferenciasLembrete(currentUser.id)
        if (!cancelled) {
          setLembreteHorario(prefs.horario_local.slice(0, 5))
          setLembreteTimezone(prefs.timezone)
        }
      } catch {
        if (!cancelled) {
          setLembreteHorario('08:00')
          setLembreteTimezone(getDefaultTimezone())
        }
      }

      setLoading(false)
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [user.id, user.user_metadata?.avatar_url, user.user_metadata?.full_name])

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    setError(null)
    setSuccess(null)

    const trimmed = nome.trim()
    if (!trimmed) {
      setErro('Informe seu nome.')
      return
    }
    if (trimmed.length < 2) {
      setErro('O nome deve ter pelo menos 2 caracteres.')
      return
    }

    setSaving(true)

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      await syncAuthSession()
      setSuccess('Perfil atualizado com sucesso!')
    }

    setSaving(false)
  }

  async function handleLembreteSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLembreteError(null)
    setLembreteSuccess(null)
    setSavingLembrete(true)

    try {
      await savePreferenciasLembrete(user.id, {
        horario_local: lembreteHorario,
        timezone: lembreteTimezone.trim() || getDefaultTimezone(),
      })
      setLembreteSuccess('Preferências de lembrete salvas com sucesso!')
    } catch (err) {
      setLembreteError(err instanceof Error ? err.message : 'Erro ao salvar lembretes.')
    } finally {
      setSavingLembrete(false)
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setAvatarError(null)
    setAvatarSuccess(null)

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploadingAvatar(true)

    try {
      await uploadAvatar(user.id, file)
      await syncAuthSession()
      setHasAvatar(true)
      setPreviewUrl(null)
      setAvatarSuccess('Foto atualizada com sucesso!')
    } catch (err) {
      setPreviewUrl(null)
      setAvatarError(err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      URL.revokeObjectURL(localPreview)
      setUploadingAvatar(false)
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError(null)
    setAvatarSuccess(null)
    setRemovingAvatar(true)

    try {
      const currentUrl = getUserAvatarUrl(user)
      await removeAvatar(user.id, currentUrl)
      await syncAuthSession()
      setHasAvatar(false)
      setPreviewUrl(null)
      setAvatarSuccess('Foto removida com sucesso!')
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Erro ao remover foto.')
    } finally {
      setRemovingAvatar(false)
    }
  }

  async function handlePasswordSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setPasswordError('Preencha todos os campos de senha.')
      return
    }
    if (novaSenha.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setPasswordError('A confirmação não coincide com a nova senha.')
      return
    }
    if (novaSenha === senhaAtual) {
      setPasswordError('A nova senha deve ser diferente da senha atual.')
      return
    }
    if (!email) {
      setPasswordError('E-mail do usuário não encontrado.')
      return
    }

    setSavingPassword(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: senhaAtual,
    })

    if (signInError) {
      setPasswordError('Senha atual incorreta.')
      setSavingPassword(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    if (updateError) {
      setPasswordError(updateError.message)
    } else {
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setPasswordSuccess('Senha alterada com sucesso!')
    }

    setSavingPassword(false)
  }

  if (loading) {
    return <p className="text-center text-slate-500">Carregando perfil...</p>
  }

  const cardClass =
    'space-y-5 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm'
  const canChangePassword = hasEmailPasswordIdentity(user)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header className="text-left">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Meu perfil</h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Gerencie suas informações pessoais
        </p>
      </header>

      {error && !loading && <AuthAlert type="error">{error}</AuthAlert>}

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-800">Foto de perfil</h2>

        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" previewUrl={previewUrl} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar || removingAvatar}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
            </button>
            {hasAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar || removingAvatar}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {removingAvatar ? 'Removendo...' : 'Remover foto'}
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <p className="text-xs text-slate-400">JPEG, PNG ou WebP. Máximo 2 MB.</p>

        {avatarError && <AuthAlert type="error">{avatarError}</AuthAlert>}
        {avatarSuccess && <AuthAlert type="success">{avatarSuccess}</AuthAlert>}
      </section>

      <form onSubmit={handleSubmit} className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-800">Dados pessoais</h2>

        <AuthField
          id="profile-nome"
          label="Nome"
          type="text"
          value={nome}
          onChange={setNome}
          placeholder="Seu nome"
          icon={<UserIcon className="h-5 w-5 text-slate-400" />}
        />
        {erro && <p className="-mt-3 text-sm text-red-600">{erro}</p>}

        <div>
          <AuthField
            id="profile-email"
            label="E-mail"
            type="email"
            value={email}
            onChange={() => {}}
            placeholder=""
            icon={<MailIcon />}
            readOnly
          />
          <p className="mt-1.5 text-xs text-slate-400">O e-mail não pode ser alterado aqui.</p>
        </div>

        {success && <AuthAlert type="success">{success}</AuthAlert>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <form onSubmit={handleLembreteSubmit} className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-800">Lembretes por e-mail</h2>
        <p className="text-sm text-slate-500">
          Ative o lembrete em cada tarefa com data prevista. Os e-mails serão enviados para{' '}
          <span className="font-medium text-slate-700">{email || 'sua conta'}</span>.
        </p>

        <div>
          <label
            htmlFor="lembrete-horario"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Horário do envio
          </label>
          <select
            id="lembrete-horario"
            value={lembreteHorario}
            onChange={(e) => setLembreteHorario(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {LEMBRETE_HORARIO_OPCOES.map((horario) => (
              <option key={horario} value={horario}>
                {horario.replace(':', 'h')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lembrete-timezone"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Fuso horário
          </label>
          <input
            id="lembrete-timezone"
            type="text"
            value={lembreteTimezone}
            onChange={(e) => setLembreteTimezone(e.target.value)}
            placeholder="America/Sao_Paulo"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Use o identificador IANA do seu fuso (ex.: America/Sao_Paulo).
          </p>
        </div>

        {lembreteError && <AuthAlert type="error">{lembreteError}</AuthAlert>}
        {lembreteSuccess && <AuthAlert type="success">{lembreteSuccess}</AuthAlert>}

        <button
          type="submit"
          disabled={savingLembrete}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {savingLembrete ? 'Salvando...' : 'Salvar lembretes'}
        </button>
      </form>

      {canChangePassword ? (
        <form onSubmit={handlePasswordSubmit} className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-800">Alterar senha</h2>

          <AuthField
            id="profile-senha-atual"
            label="Senha atual"
            type={showSenhaAtual ? 'text' : 'password'}
            value={senhaAtual}
            onChange={setSenhaAtual}
            placeholder="Sua senha atual"
            icon={<LockIcon />}
            rightSlot={
              <PasswordToggle
                visible={showSenhaAtual}
                onToggle={() => setShowSenhaAtual((prev) => !prev)}
              />
            }
          />

          <AuthField
            id="profile-nova-senha"
            label="Nova senha"
            type={showNovaSenha ? 'text' : 'password'}
            value={novaSenha}
            onChange={setNovaSenha}
            placeholder="Mínimo 6 caracteres"
            icon={<LockIcon />}
            minLength={6}
            rightSlot={
              <PasswordToggle
                visible={showNovaSenha}
                onToggle={() => setShowNovaSenha((prev) => !prev)}
              />
            }
          />

          <AuthField
            id="profile-confirmar-senha"
            label="Confirmar nova senha"
            type={showConfirmarSenha ? 'text' : 'password'}
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            placeholder="Repita a nova senha"
            icon={<LockIcon />}
            minLength={6}
            rightSlot={
              <PasswordToggle
                visible={showConfirmarSenha}
                onToggle={() => setShowConfirmarSenha((prev) => !prev)}
              />
            }
          />

          {passwordError && <AuthAlert type="error">{passwordError}</AuthAlert>}
          {passwordSuccess && <AuthAlert type="success">{passwordSuccess}</AuthAlert>}

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {savingPassword ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      ) : (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-800">Senha</h2>
          <p className="text-sm text-slate-500">
            Sua conta usa login com Google. A senha é gerenciada pela sua conta Google.
          </p>
        </section>
      )}
    </div>
  )
}
