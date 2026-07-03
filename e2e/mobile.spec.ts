import { test, expect } from './fixtures'
import { goToDashboard, openMobileMenu } from './helpers/navigation'

test.use({ viewport: { width: 390, height: 844 } })

test.describe('Mobile', () => {
  test('abre menu lateral e navega para o dashboard', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible()

    await openMobileMenu(page)
    await goToDashboard(page)
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
  })

  test('exibe botão flutuante de nova tarefa na visão tarefas', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    await expect(page.getByRole('button', { name: 'Nova tarefa' })).toBeVisible()
  })
})
