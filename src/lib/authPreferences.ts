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

/** Storage adapter that follows the current "Lembrar-me" preference on every read/write. */
export function createAuthStorageAdapter(): Storage {
  return {
    get length() {
      return getAuthStorage().length
    },
    clear() {
      getAuthStorage().clear()
    },
    getItem(key: string) {
      return getAuthStorage().getItem(key)
    },
    setItem(key: string, value: string) {
      getAuthStorage().setItem(key, value)
    },
    removeItem(key: string) {
      getAuthStorage().removeItem(key)
    },
    key(index: number) {
      return getAuthStorage().key(index)
    },
  }
}

export function getSupabaseAuthStorageKey(): string | null {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    if (!url || typeof url !== 'string') return null
    const projectRef = new URL(url).hostname.split('.')[0]
    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}

/** Moves or clears the Supabase session token across storages when "Lembrar-me" changes. */
export function migrateSessionStorage(remember: boolean) {
  const key = getSupabaseAuthStorageKey()
  if (!key) return

  const target = remember ? localStorage : sessionStorage
  const source = remember ? sessionStorage : localStorage

  if (!target.getItem(key)) {
    const data = source.getItem(key)
    if (data) {
      target.setItem(key, data)
    }
  }

  source.removeItem(key)
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
