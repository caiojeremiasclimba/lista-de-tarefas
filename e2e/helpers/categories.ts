import { expect, type Page } from '@playwright/test'

function sidebarNav(page: Page) {
  return page.getByRole('navigation', { name: 'Navegação e filtros' })
}

export async function expandCategoryFilters(page: Page) {
  const button = sidebarNav(page).getByRole('button', { name: 'Por categoria' })
  if ((await button.getAttribute('aria-expanded')) !== 'true') {
    await button.click()
  }
}

export async function openNewCategoryModal(page: Page) {
  await expandCategoryFilters(page)
  await sidebarNav(page).getByRole('button', { name: 'Nova categoria' }).click()
  await expect(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
}

export async function submitNewCategory(page: Page, nome: string, corLabel = 'Cinza') {
  await openNewCategoryModal(page)
  await page.getByLabel('Nome *').fill(nome)
  await page.getByRole('button', { name: `Cor ${corLabel}` }).click()
  await page.getByRole('button', { name: 'Criar' }).click()
}

export async function submitCategoryEdit(page: Page, nomeAtual: string, novoNome: string) {
  await openCategoryMenu(page, nomeAtual)
  await page.getByRole('button', { name: 'Editar' }).click()
  await expect(page.getByRole('dialog', { name: 'Editar categoria' })).toBeVisible()
  await page.getByLabel('Nome *').fill(novoNome)
  await page.getByRole('button', { name: 'Salvar' }).click()
}

export async function confirmDeleteCategory(page: Page, nome: string) {
  await openCategoryMenu(page, nome)
  await page.getByRole('button', { name: 'Excluir' }).click()
  const dialog = page.getByRole('dialog', { name: 'Excluir categoria' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Excluir' }).click()
}

export async function createCategory(page: Page, nome: string, corLabel = 'Cinza') {
  await openNewCategoryModal(page)
  await page.getByLabel('Nome *').fill(nome)
  await page.getByRole('button', { name: `Cor ${corLabel}` }).click()
  await page.getByRole('button', { name: 'Criar' }).click()
  await expect(page.getByText('Categoria criada com sucesso.')).toBeVisible()
}

export async function filterByCategory(page: Page, nome: string) {
  await expandCategoryFilters(page)
  await sidebarNav(page)
    .getByRole('button', { name: new RegExp(`^${nome}\\s+\\d`, 'i') })
    .click()
}

export async function openCategoryMenu(page: Page, nome: string) {
  await expandCategoryFilters(page)
  await page.getByRole('button', { name: `Ações da categoria ${nome}` }).click()
}

export async function editCategory(page: Page, nomeAtual: string, novoNome: string) {
  await openCategoryMenu(page, nomeAtual)
  await page.getByRole('button', { name: 'Editar' }).click()
  await expect(page.getByRole('dialog', { name: 'Editar categoria' })).toBeVisible()
  await page.getByLabel('Nome *').fill(novoNome)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Categoria atualizada com sucesso.')).toBeVisible()
}

export async function deleteCategory(page: Page, nome: string) {
  await openCategoryMenu(page, nome)
  await page.getByRole('button', { name: 'Excluir' }).click()

  const dialog = page.getByRole('dialog', { name: 'Excluir categoria' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Categoria excluída com sucesso.')).toBeVisible()
}

export async function cancelDeleteCategory(page: Page, nome: string) {
  await openCategoryMenu(page, nome)
  await page.getByRole('button', { name: 'Excluir' }).click()

  const dialog = page.getByRole('dialog', { name: 'Excluir categoria' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
}
