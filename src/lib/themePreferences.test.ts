import {
  applyThemeToDocument,
  DEFAULT_THEME_MODE,
  getThemePreference,
  loadThemePreference,
  saveThemePreference,
  THEME_PREFS_KEY,
  toggleThemeMode,
} from './themePreferences'

describe('themePreferences', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('retorna null quando storage está vazio', () => {
    expect(loadThemePreference()).toBeNull()
  })

  it('usa modo claro como padrão', () => {
    expect(getThemePreference()).toBe(DEFAULT_THEME_MODE)
  })

  it('salva e restaura preferência válida', () => {
    saveThemePreference('dark')
    expect(loadThemePreference()).toBe('dark')
    expect(getThemePreference()).toBe('dark')
  })

  it('ignora valor inválido no storage', () => {
    localStorage.setItem(THEME_PREFS_KEY, 'sepia')
    expect(loadThemePreference()).toBeNull()
    expect(getThemePreference()).toBe(DEFAULT_THEME_MODE)
  })

  it('alterna entre claro e escuro', () => {
    expect(toggleThemeMode('light')).toBe('dark')
    expect(toggleThemeMode('dark')).toBe('light')
  })

  it('aplica classe dark e color-scheme no documento', () => {
    applyThemeToDocument('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    applyThemeToDocument('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })
})
