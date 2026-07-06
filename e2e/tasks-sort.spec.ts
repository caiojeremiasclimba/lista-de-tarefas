import { test, expect } from './fixtures'
import { filterByStatus, taskSection } from './helpers/tasks'

test.describe('Tarefas — ordenação', () => {
  test('ordena pendentes por título', async ({ page, authenticatedWithSortableTasks: _state }) => {
    await filterByStatus(page, 'Pendentes')
    await page.locator('#ordenacao').selectOption('Título (A–Z)')

    const pendentes = taskSection(page, 'PENDENTES')
    await expect(pendentes.getByRole('heading').nth(0)).toHaveText('Abacaxi ordenar')
    await expect(pendentes.getByRole('heading').nth(1)).toHaveText('Zebra ordenar')
  })

  test('ordena pendentes por data prevista', async ({
    page,
    authenticatedWithSortableTasks: _state,
  }) => {
    await filterByStatus(page, 'Pendentes')
    await page.locator('#ordenacao').selectOption('Data prevista')

    const pendentes = taskSection(page, 'PENDENTES')
    await expect(pendentes.getByRole('heading').nth(0)).toHaveText('Abacaxi ordenar')
    await expect(pendentes.getByRole('heading').nth(1)).toHaveText('Zebra ordenar')
  })

  test('persiste ordenação após recarregar a página', async ({
    page,
    authenticatedWithSortableTasks: _state,
  }) => {
    await page.locator('#ordenacao').selectOption('Título (A–Z)')
    await page.reload()

    await expect(page.locator('#ordenacao')).toHaveValue('titulo')
  })
})
