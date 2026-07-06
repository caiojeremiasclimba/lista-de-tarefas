import {
  APP_SHELL_PREFS_KEY,
  getDefaultAppShellPreferences,
  loadAppShellPreferences,
  saveAppShellPreferences,
} from './appShellPreferences'

describe('appShellPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retorna null quando storage está vazio', () => {
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('salva e restaura preferências válidas', () => {
    const prefs = {
      ...getDefaultAppShellPreferences(),
      view: 'dashboard' as const,
      filtroAtivo: 'pendente' as const,
      filtroCategoria: 'cat-1',
      filtroPrioridade: 'alta' as const,
      secoesAbertas: {
        pendente: true,
        em_andamento: false,
        concluida: false,
        cancelada: true,
        vence_hoje: true,
        vencidas: true,
      },
    }

    saveAppShellPreferences(prefs)
    expect(loadAppShellPreferences()).toEqual(prefs)
  })

  it('ignora JSON inválido', () => {
    localStorage.setItem(APP_SHELL_PREFS_KEY, '{ invalid')
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('ignora versão desconhecida', () => {
    localStorage.setItem(APP_SHELL_PREFS_KEY, JSON.stringify({ version: 2, view: 'tarefas' }))
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('ignora view inválida', () => {
    localStorage.setItem(
      APP_SHELL_PREFS_KEY,
      JSON.stringify({ ...getDefaultAppShellPreferences(), view: 'invalid' })
    )
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('ignora filtroAtivo inválido', () => {
    localStorage.setItem(
      APP_SHELL_PREFS_KEY,
      JSON.stringify({ ...getDefaultAppShellPreferences(), filtroAtivo: 'foo' })
    )
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('ignora prioridade inválida', () => {
    localStorage.setItem(
      APP_SHELL_PREFS_KEY,
      JSON.stringify({ ...getDefaultAppShellPreferences(), filtroPrioridade: 'urgente' })
    )
    expect(loadAppShellPreferences()).toBeNull()
  })

  it('aceita filtroCategoria null', () => {
    const prefs = { ...getDefaultAppShellPreferences(), filtroCategoria: null }
    saveAppShellPreferences(prefs)
    expect(loadAppShellPreferences()?.filtroCategoria).toBeNull()
  })

  it('ignora secoesAbertas incompletas', () => {
    localStorage.setItem(
      APP_SHELL_PREFS_KEY,
      JSON.stringify({
        ...getDefaultAppShellPreferences(),
        secoesAbertas: { pendente: true },
      })
    )
    expect(loadAppShellPreferences()).toBeNull()
  })
})
