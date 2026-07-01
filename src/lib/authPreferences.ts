export const REMEMBER_ME_KEY = 'lista-tarefas:remember-me'
export const REMEMBERED_EMAIL_KEY = 'lista-tarefas:remembered-email'
export const PENDING_PASSWORD_RESET_KEY = 'lista-tarefas:pending-password-reset'

export function getRememberMePreference(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false'
}

export function setRememberMePreference(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')
}

export function getAuthStorage(): Storage {
  return getRememberMePreference() ? localStorage : sessionStorage
}

function getSupabaseAuthStorageKey(): string {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const projectRef = new URL(url).hostname.split('.')[0]
  return `sb-${projectRef}-auth-token`
}

export function migrateSessionStorage(remember: boolean) {
  const key = getSupabaseAuthStorageKey()
  const target = remember ? localStorage : sessionStorage
  const source = remember ? sessionStorage : localStorage
  const data = source.getItem(key)

  if (data) {
    target.setItem(key, data)
    source.removeItem(key)
  }
}

export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBERED_EMAIL_KEY)
}

export function setRememberedEmail(email: string | null) {
  if (email) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY)
  }
}

export function markPendingPasswordReset() {
  sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, 'true')
}

export function clearPendingPasswordReset() {
  sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY)
}

export function hasPendingPasswordReset(): boolean {
  return sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY) === 'true'
}

export function isRecoveryCallback(): boolean {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return hashParams.get('type') === 'recovery'
}

/** Removes Supabase recovery tokens from the URL after the session is established. */
export function clearRecoveryCallbackFromUrl(): void {
  if (!isRecoveryCallback()) return

  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}
