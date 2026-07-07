export const THEME_PREFS_KEY = 'lista-tarefas:theme'

export type ThemeMode = 'light' | 'dark'

export const DEFAULT_THEME_MODE: ThemeMode = 'light'

export const THEME_MODES: ThemeMode[] = ['light', 'dark']

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)
}

export function loadThemePreference(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_PREFS_KEY)
    if (!stored) return null
    return isThemeMode(stored) ? stored : null
  } catch {
    return null
  }
}

export function getThemePreference(): ThemeMode {
  return loadThemePreference() ?? DEFAULT_THEME_MODE
}

export function saveThemePreference(mode: ThemeMode): void {
  localStorage.setItem(THEME_PREFS_KEY, mode)
}

export function applyThemeToDocument(mode: ThemeMode): void {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'light' ? 'dark' : 'light'
}
