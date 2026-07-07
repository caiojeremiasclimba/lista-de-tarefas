import { expect, type Page } from '@playwright/test'

export const THEME_PREFS_KEY = 'lista-tarefas:theme'

export async function clearThemePreference(page: Page) {
  await page.evaluate((key) => localStorage.removeItem(key), THEME_PREFS_KEY)
}

export async function setThemePreference(page: Page, theme: 'light' | 'dark') {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: THEME_PREFS_KEY, value: theme }
  )
}

export async function getThemePreference(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), THEME_PREFS_KEY)
}

export async function activateDarkMode(page: Page) {
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click()
}

export async function activateLightMode(page: Page) {
  await page.getByRole('button', { name: 'Ativar modo claro' }).click()
}

export async function expectDarkMode(page: Page) {
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect.poll(() => getThemePreference(page)).toBe('dark')
}

export async function expectLightMode(page: Page) {
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect.poll(() => getThemePreference(page)).toBe('light')
}

export function sidebarThemeToggle(page: Page) {
  return page.locator('aside').getByRole('button', { name: /Ativar modo (claro|escuro)/ })
}

export function profileThemeToggle(page: Page) {
  return page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Aparência' }) })
    .getByRole('button', { name: /Ativar modo (claro|escuro)/ })
}
