import { test, expect } from './fixtures'
import {
  createTask,
  filterByOverview,
  filterByPrioridade,
  filterByStatus,
  taskCard,
} from './helpers/tasks'

test.describe('Tarefas — filtros e busca', () => {
  test('filtra tarefas concluídas na sidebar', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await filterByStatus(page, 'Concluídas')

    await expect(page.getByRole('heading', { name: 'Tarefa concluída' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa pendente' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa em andamento' })).not.toBeVisible()
  })

  test('filtra tarefas pendentes na sidebar', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await filterByStatus(page, 'Pendentes')

    await expect(page.getByRole('heading', { name: 'Tarefa pendente' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Relatório mensal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa concluída' })).not.toBeVisible()
  })

  test('volta a exibir todas as tarefas ao selecionar filtro Todas', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await filterByStatus(page, 'Concluídas')
    await expect(page.getByRole('heading', { name: 'Tarefa pendente' })).not.toBeVisible()

    await filterByOverview(page, 'Todas')

    await expect(page.getByRole('heading', { name: 'Tarefa pendente' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa concluída' })).toBeVisible()
  })

  test('busca tarefas pelo título', async ({ page, authenticatedWithMixedTasks: _state }) => {
    await page.getByPlaceholder('Buscar...').fill('Relatório')

    await expect(page.getByRole('heading', { name: 'Relatório mensal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa pendente' })).not.toBeVisible()
  })

  test('busca sem resultado exibe mensagem vazia', async ({
    page,
    authenticatedWithMixedTasks: _state,
  }) => {
    await page.getByPlaceholder('Buscar...').fill('inexistente')

    await expect(page.getByText('Nenhum resultado para "inexistente"')).toBeVisible()
  })

  test('filtra tarefas vencidas', async ({ page, authenticatedWithOverdueTasks: _state }) => {
    await filterByOverview(page, 'Vencidas')

    const vencida = taskCard(page, 'Tarefa vencida')
    await expect(vencida.getByRole('heading', { name: 'Tarefa vencida' })).toBeVisible()
    await expect(vencida.getByText('Vencida', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa em dia' })).not.toBeVisible()
  })

  test('filtra tarefas canceladas', async ({ page, authenticatedWithCancelledTasks: _state }) => {
    await filterByStatus(page, 'Canceladas')

    const cancelada = taskCard(page, 'Tarefa cancelada')
    await expect(cancelada.getByRole('heading', { name: 'Tarefa cancelada' })).toBeVisible()
    await expect(cancelada.getByText('Cancelada', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa ativa' })).not.toBeVisible()
  })

  test('filtra tarefas por prioridade alta', async ({
    page,
    authenticatedWithMixedPriorities: _state,
  }) => {
    await filterByPrioridade(page, 'Alta')

    await expect(page.getByRole('heading', { name: 'Tarefa prioridade alta' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa prioridade média' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa prioridade baixa' })).not.toBeVisible()
  })
})

test.describe('Tarefas — status', () => {
  test('avança status pelo botão rápido na lista', async ({ page, authenticatedPage: _auth }) => {
    await createTask(page, 'Tarefa de status')

    const card = taskCard(page, 'Tarefa de status')
    await card.getByRole('button', { name: 'Marcar como em andamento' }).click()
    await expect(card.getByText('Em andamento')).toBeVisible()

    await card.getByRole('button', { name: 'Marcar como concluída' }).click()
    await expect(card.getByText('Concluída')).toBeVisible()
  })

  test('tarefa concluída volta para pendente ao clicar no status', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    await createTask(page, 'Tarefa para reabrir')

    const card = taskCard(page, 'Tarefa para reabrir')
    await card.getByRole('button', { name: 'Marcar como em andamento' }).click()
    await card.getByRole('button', { name: 'Marcar como concluída' }).click()
    await expect(card.getByText('Concluída')).toBeVisible()

    await card.getByRole('button', { name: 'Marcar como pendente' }).click()
    await expect(card.getByText('Pendente')).toBeVisible()
  })
})
