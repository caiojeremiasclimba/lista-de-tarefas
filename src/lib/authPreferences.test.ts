import {
  clearPendingPasswordReset,
  clearRecoveryCallbackFromUrl,
  createAuthStorageAdapter,
  getAuthStorage,
  getRememberedEmail,
  getRememberMePreference,
  getSupabaseAuthStorageKey,
  hasPendingPasswordReset,
  isRecoveryCallback,
  markPendingPasswordReset,
  migrateSessionStorage,
  PENDING_PASSWORD_RESET_KEY,
  setRememberedEmail,
  setRememberMePreference,
} from './authPreferences'

/**
 * Testa preferências de autenticação: "Lembrar-me", e-mail salvo e recovery de senha.
 * Usa localStorage/sessionStorage do jsdom e mocks de window.location.
 */
describe('getRememberMePreference / setRememberMePreference', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('retorna true por padrão quando chave não existe', () => {
    expect(getRememberMePreference()).toBe(true)
  })

  it('retorna false quando usuário desmarcou Lembrar-me', () => {
    setRememberMePreference(false)
    expect(getRememberMePreference()).toBe(false)
  })
})

describe('getAuthStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('usa localStorage quando Lembrar-me está ativo', () => {
    setRememberMePreference(true)
    expect(getAuthStorage()).toBe(localStorage)
  })

  it('usa sessionStorage quando Lembrar-me está desativado', () => {
    setRememberMePreference(false)
    expect(getAuthStorage()).toBe(sessionStorage)
  })
})

describe('createAuthStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('delega leitura e escrita ao storage conforme preferência', () => {
    setRememberMePreference(true)
    const adapter = createAuthStorageAdapter()

    adapter.setItem('token', 'abc')
    expect(localStorage.getItem('token')).toBe('abc')
    expect(adapter.getItem('token')).toBe('abc')
  })
})

describe('getSupabaseAuthStorageKey', () => {
  it('extrai chave do project ref na URL do Supabase', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://meuprojeto.supabase.co')

    expect(getSupabaseAuthStorageKey()).toBe('sb-meuprojeto-auth-token')

    vi.unstubAllEnvs()
  })

  it('retorna null quando URL não está configurada', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')

    expect(getSupabaseAuthStorageKey()).toBeNull()

    vi.unstubAllEnvs()
  })
})

describe('migrateSessionStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://meuprojeto.supabase.co')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('move token de sessionStorage para localStorage ao ativar Lembrar-me', () => {
    sessionStorage.setItem('sb-meuprojeto-auth-token', '{"access_token":"x"}')

    migrateSessionStorage(true)

    expect(localStorage.getItem('sb-meuprojeto-auth-token')).toBe('{"access_token":"x"}')
    expect(sessionStorage.getItem('sb-meuprojeto-auth-token')).toBeNull()
  })

  it('move token de localStorage para sessionStorage ao desativar Lembrar-me', () => {
    localStorage.setItem('sb-meuprojeto-auth-token', '{"access_token":"y"}')

    migrateSessionStorage(false)

    expect(sessionStorage.getItem('sb-meuprojeto-auth-token')).toBe('{"access_token":"y"}')
    expect(localStorage.getItem('sb-meuprojeto-auth-token')).toBeNull()
  })
})

describe('e-mail lembrado', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('salva e recupera e-mail', () => {
    setRememberedEmail('user@example.com')
    expect(getRememberedEmail()).toBe('user@example.com')
  })

  it('remove e-mail quando passado null', () => {
    setRememberedEmail('user@example.com')
    setRememberedEmail(null)
    expect(getRememberedEmail()).toBeNull()
  })
})

describe('recuperação de senha', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('marca e limpa pending password reset', () => {
    markPendingPasswordReset()
    expect(hasPendingPasswordReset()).toBe(true)

    clearPendingPasswordReset()
    expect(hasPendingPasswordReset()).toBe(false)
    expect(sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY)).toBeNull()
  })
})

describe('isRecoveryCallback / clearRecoveryCallbackFromUrl', () => {
  const originalHash = window.location.hash
  const originalPathname = window.location.pathname
  const replaceState = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('history', { ...window.history, replaceState })
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = originalHash
    vi.restoreAllMocks()
  })

  it('detecta callback de recovery no hash da URL', () => {
    window.location.hash = '#type=recovery&access_token=xyz'

    expect(isRecoveryCallback()).toBe(true)
  })

  it('retorna false quando não é recovery', () => {
    window.location.hash = '#type=signup'

    expect(isRecoveryCallback()).toBe(false)
  })

  it('remove hash da URL após recovery', () => {
    window.location.hash = '#type=recovery'
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: originalPathname, search: '' },
      writable: true,
    })

    clearRecoveryCallbackFromUrl()

    expect(replaceState).toHaveBeenCalledWith(null, '', originalPathname)
  })
})
