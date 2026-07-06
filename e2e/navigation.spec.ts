import { test, expect } from './fixtures'
import { goToDashboard, goToProfile, goToTasks, logout } from './helpers/navigation'

test.describe('Navegação', () => {
  test('exibe dashboard com indicadores', async ({ page, authenticatedWithMixedTasks: _state }) => {
    await goToDashboard(page)

    const main = page.getByRole('main')
    await expect(main.getByText('% concluído')).toBeVisible()
    await expect(main.getByRole('paragraph').filter({ hasText: /^Por status$/ })).toBeVisible()
    await expect(main.getByRole('paragraph').filter({ hasText: /^Por prioridade$/ })).toBeVisible()
    await expect(main.getByText('Concluídas na semana')).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Distribuição por status' })).toBeVisible()
  })

  test('navega entre dashboard, tarefas e perfil', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await goToDashboard(page)
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()

    await goToTasks(page)
    await expect(page.getByPlaceholder('Buscar...')).toBeVisible()

    await goToProfile(page)
    await expect(page.getByRole('heading', { name: 'Meu perfil', level: 1 })).toBeVisible()
    await expect(page.getByLabel('E-mail')).toHaveValue('e2e@test.com')
  })

  test('atualiza nome no perfil', async ({ page, authenticatedPage: _auth }) => {
    await goToProfile(page)
    await page.getByLabel('Nome').fill('Usuário E2E')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()

    await expect(page.getByText('Perfil atualizado com sucesso!')).toBeVisible()
  })

  test('faz logout e retorna à tela de login', async ({ page, authenticatedPage: _auth }) => {
    await logout(page)
  })
})
