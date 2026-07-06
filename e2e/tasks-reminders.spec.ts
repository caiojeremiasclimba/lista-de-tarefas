import { test, expect } from './fixtures'
import { openNewTaskModal } from './helpers/tasks'

test.describe('Tarefas — lembretes por e-mail', () => {
  test('permite ativar lembrete ao informar data prevista', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    await openNewTaskModal(page)
    await page.getByLabel('Título *').fill('Entregar relatório')
    await page.locator('#data_prevista').fill('2026-07-10')

    const lembreteCheckbox = page.getByLabel('Enviar lembrete por e-mail')
    await expect(lembreteCheckbox).toBeEnabled()
    await lembreteCheckbox.check()

    await expect(page.getByLabel('Quando lembrar')).toBeVisible()
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()

    const card = page
      .getByRole('heading', { name: 'Entregar relatório' })
      .locator('..')
      .locator('..')
    await expect(card.getByText('Lembrete · No dia')).toBeVisible()
  })

  test('exige data prevista para ativar lembrete', async ({ page, authenticatedPage: _auth }) => {
    await openNewTaskModal(page)
    await page.getByLabel('Título *').fill('Tarefa sem data')
    await expect(page.getByLabel('Enviar lembrete por e-mail')).toBeDisabled()
    await expect(
      page.getByText('Informe uma data prevista para ativar lembretes por e-mail.')
    ).toBeVisible()
  })

  test('persiste lembrete ao editar tarefa', async ({ page, authenticatedPage: _auth }) => {
    await openNewTaskModal(page)
    await page.getByLabel('Título *').fill('Revisar contrato')
    await page.locator('#data_prevista').fill('2026-07-15')
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
    await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()

    await page
      .locator('li')
      .filter({ has: page.getByRole('heading', { name: 'Revisar contrato' }) })
      .getByRole('button', { name: 'Ações da tarefa' })
      .click()
    await page.getByRole('button', { name: 'Editar' }).click()

    await page.getByLabel('Enviar lembrete por e-mail').check()
    await page.getByLabel('Quando lembrar').selectOption('um_dia_antes')
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    const card = page.getByRole('heading', { name: 'Revisar contrato' }).locator('..').locator('..')
    await expect(card.getByText('Lembrete · 1 dia antes')).toBeVisible()
  })
})
