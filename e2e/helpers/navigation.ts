import { expect, type Page } from '@playwright/test'

function sidebarNav(page: Page) {
  return page.getByRole('navigation', { name: 'Navegação e filtros' })
}

export async function goToDashboard(page: Page) {
  await sidebarNav(page).getByRole('button', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
}

export async function goToTasks(page: Page) {
  await sidebarNav(page).getByRole('button', { name: 'Tarefas' }).click()
  await expect(page.getByPlaceholder('Buscar...')).toBeVisible()
}

export async function goToProfile(page: Page) {
  await page.getByRole('button', { name: 'Abrir perfil' }).first().click()
  await expect(page.getByRole('heading', { name: 'Meu perfil', level: 1 })).toBeVisible()
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page.getByRole('heading', { name: 'Lista de Tarefas' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
}

export async function openMobileMenu(page: Page) {
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await expect(sidebarNav(page)).toBeVisible()
}

export async function closeMobileMenu(page: Page) {
  await page.getByRole('button', { name: 'Fechar menu' }).first().click()
}
