import { test, expect } from './fixtures'
import { goToProfile } from './helpers/navigation'
import {
  activateDarkMode,
  activateLightMode,
  clearThemePreference,
  expectDarkMode,
  expectLightMode,
  profileThemeToggle,
  setThemePreference,
  sidebarThemeToggle,
} from './helpers/theme'

test.describe('Tema', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearThemePreference(page)
  })

  test('alterna para modo escuro na tela de login', async ({ page, supabaseMock: _state }) => {
    await activateDarkMode(page)
    await expectDarkMode(page)
    await expect(page.getByRole('button', { name: 'Ativar modo claro' })).toBeVisible()
  })

  test('alterna de volta para modo claro na tela de login', async ({
    page,
    supabaseMock: _state,
  }) => {
    await activateDarkMode(page)
    await activateLightMode(page)
    await expectLightMode(page)
  })

  test('persiste modo escuro após recarregar', async ({ page, supabaseMock: _state }) => {
    await activateDarkMode(page)
    await page.reload()
    await expectDarkMode(page)
  })

  test('restaura modo escuro salvo ao abrir a página', async ({ page, supabaseMock: _state }) => {
    await setThemePreference(page, 'dark')
    await page.reload()
    await expectDarkMode(page)
  })

  test('alterna tema logado pela sidebar', async ({ page, authenticatedPage: _auth }) => {
    await sidebarThemeToggle(page).click()
    await expectDarkMode(page)
  })

  test('alterna tema na seção Aparência do perfil', async ({ page, authenticatedPage: _auth }) => {
    await goToProfile(page)
    await profileThemeToggle(page).click()
    await expectDarkMode(page)
  })
})
