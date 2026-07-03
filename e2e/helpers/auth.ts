import { type Page } from '@playwright/test'

export async function goToSignUp(page: Page) {
  await page.getByRole('button', { name: 'Cadastro' }).click()
}

export async function goToLogin(page: Page) {
  await page.getByRole('button', { name: 'Login' }).click()
}

export async function attemptLogin(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

export async function signUp(page: Page, email: string, password: string) {
  await goToSignUp(page)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()
}

export async function requestPasswordReset(page: Page, email: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByRole('button', { name: 'Esqueceu sua senha?' }).click()
}
