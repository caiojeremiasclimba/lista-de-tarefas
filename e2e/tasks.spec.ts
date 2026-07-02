import { test, expect } from './fixtures'

test.describe('Tarefas', () => {
  test('cria uma tarefa e exibe toast de sucesso', async ({ page, authenticatedPage: _auth }) => {
    await page.getByRole('button', { name: 'Nova tarefa' }).click()
    await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()

    await page.getByLabel('Título *').fill('Comprar leite')
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()

    await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprar leite' })).toBeVisible()
  })

  test('exclui tarefa após confirmação no modal', async ({ page, authenticatedPage: _auth }) => {
    await page.getByRole('button', { name: 'Nova tarefa' }).click()
    await page.getByLabel('Título *').fill('Tarefa para excluir')
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
    await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()

    const taskCard = page.locator('li').filter({ hasText: 'Tarefa para excluir' })
    await taskCard.getByRole('button', { name: 'Ações da tarefa' }).click()
    await taskCard.getByRole('button', { name: 'Excluir' }).click()

    const dialog = page.getByRole('dialog', { name: 'Excluir tarefa' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Tarefa excluída com sucesso.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa para excluir' })).not.toBeVisible()
  })

  test('cancelar exclusão mantém a tarefa na lista', async ({ page, authenticatedPage: _auth }) => {
    await page.getByRole('button', { name: 'Nova tarefa' }).click()
    await page.getByLabel('Título *').fill('Tarefa que fica')
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
    await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()

    const taskCard = page.locator('li').filter({ hasText: 'Tarefa que fica' })
    await taskCard.getByRole('button', { name: 'Ações da tarefa' }).click()
    await taskCard.getByRole('button', { name: 'Excluir' }).click()

    await page
      .getByRole('dialog', { name: 'Excluir tarefa' })
      .getByRole('button', { name: 'Cancelar' })
      .click()

    await expect(page.getByRole('heading', { name: 'Tarefa que fica' })).toBeVisible()
    await expect(page.getByText('Tarefa excluída com sucesso.')).not.toBeVisible()
  })
})
