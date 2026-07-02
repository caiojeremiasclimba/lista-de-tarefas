import { test, expect } from './fixtures'

test.describe('Autenticação', () => {
  test('exibe tela de login', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Lista de Tarefas' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('entra na área de tarefas após login', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')
    await page.getByLabel('E-mail').fill('e2e@test.com')
    await page.getByLabel('Senha', { exact: true }).fill('senha-e2e')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('button', { name: 'Nova tarefa' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
