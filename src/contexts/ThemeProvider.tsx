import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  applyThemeToDocument,
  getThemePreference,
  saveThemePreference,
  toggleThemeMode,
  type ThemeMode,
} from '../lib/themePreferences'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getThemePreference())

  useEffect(() => {
    applyThemeToDocument(theme)
    saveThemePreference(theme)
  }, [theme])

  const setTheme = (mode: ThemeMode) => setThemeState(mode)

  const toggleTheme = () => setThemeState((current) => toggleThemeMode(current))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
