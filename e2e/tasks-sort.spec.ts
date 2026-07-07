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

  test('ordena seção Vencidas por título na visão Todas', async ({
    page,
    authenticatedWithSortableOverdueTasks: _state,
  }) => {
    await page.locator('#ordenacao').selectOption('Título (A–Z)')

    const vencidas = taskSection(page, 'VENCIDAS')
    await expect(vencidas.getByRole('heading').nth(0)).toHaveText('Abacaxi vencida')
    await expect(vencidas.getByRole('heading').nth(1)).toHaveText('Zebra vencida')
  })

  test('ordena seção Vencidas por data prevista na visão Todas', async ({
    page,
    authenticatedWithSortableOverdueTasks: _state,
  }) => {
    await page.locator('#ordenacao').selectOption('Data prevista')

    const vencidas = taskSection(page, 'VENCIDAS')
    await expect(vencidas.getByRole('heading').nth(0)).toHaveText('Abacaxi vencida')
    await expect(vencidas.getByRole('heading').nth(1)).toHaveText('Zebra vencida')
  })

  test('ordena seção Vence hoje por título na visão Todas', async ({
    page,
    authenticatedWithSortableDueTodayTasks: _state,
  }) => {
    await page.clock.install({ time: new Date('2026-07-02T12:00:00') })
    await page.reload()

    await page.locator('#ordenacao').selectOption('Título (A–Z)')

    const venceHoje = taskSection(page, 'VENCE HOJE')
    await expect(venceHoje.getByRole('heading').nth(0)).toHaveText('Abacaxi hoje')
    await expect(venceHoje.getByRole('heading').nth(1)).toHaveText('Zebra hoje')
  })

  test('ordena seção Vence hoje por data prevista na visão Todas', async ({
    page,
    authenticatedWithSortableDueTodayTasks: _state,
  }) => {
    await page.clock.install({ time: new Date('2026-07-02T12:00:00') })
    await page.reload()

    await page.locator('#ordenacao').selectOption('Data prevista')

    const venceHoje = taskSection(page, 'VENCE HOJE')
    await expect(venceHoje.getByRole('heading').nth(0)).toHaveText('Abacaxi hoje')
    await expect(venceHoje.getByRole('heading').nth(1)).toHaveText('Zebra hoje')
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
