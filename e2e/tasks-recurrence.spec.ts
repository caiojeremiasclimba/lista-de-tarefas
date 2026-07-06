import { test, expect } from './fixtures'
import { failRestOnce } from './helpers/supabaseMock'
import {
  completeTaskViaToggle,
  createRecurringTask,
  editTaskDetails,
  openNewTaskModal,
  reopenCompletedTaskViaToggle,
  taskCard,
  taskSection,
} from './helpers/tasks'

const FIXED_TIME = new Date('2026-07-02T12:00:00')

test.describe('Tarefas — recorrência', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: FIXED_TIME })
  })

  test('ao concluir tarefa semanal, cria próxima ocorrência pendente', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    const titulo = 'Reunião semanal'

    await createRecurringTask(page, titulo, {
      data_prevista: '2026-07-02',
      tipo: 'semanal',
    })

    const card = taskCard(page, titulo).first()
    await expect(card.getByText('Recorrente · Semanal')).toBeVisible()

    await completeTaskViaToggle(page, titulo)

    const pendentes = taskSection(page, 'PENDENTES')
    const concluidas = taskSection(page, 'CONCLUÍDAS')

    const concluidaCard = concluidas.locator('li').filter({ hasText: titulo })
    const pendenteCard = pendentes.locator('li').filter({ hasText: titulo })

    await expect(concluidaCard.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(concluidaCard.getByText('Concluída', { exact: true })).toBeVisible()

    await expect(pendenteCard.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(pendenteCard.getByText('Pendente', { exact: true })).toBeVisible()
    await expect(pendenteCard.getByText('09/07/2026')).toBeVisible()
    await expect(pendenteCard.getByText('Recorrente · Semanal')).toBeVisible()
  })

  test('não duplica ocorrência ao reabrir tarefa concluída e concluir de novo', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    const titulo = 'Reunião duplicada'

    await createRecurringTask(page, titulo, {
      data_prevista: '2026-07-02',
      tipo: 'semanal',
    })

    await completeTaskViaToggle(page, titulo)

    const pendentes = taskSection(page, 'PENDENTES')
    const concluidas = taskSection(page, 'CONCLUÍDAS')

    await expect(pendentes.getByRole('heading', { name: titulo })).toHaveCount(1)
    await expect(concluidas.getByRole('heading', { name: titulo })).toHaveCount(1)

    await reopenCompletedTaskViaToggle(page, titulo)

    const reopenedCard = pendentes
      .locator('li')
      .filter({ hasText: titulo })
      .filter({ hasText: 'Vence hoje' })
    await reopenedCard.getByRole('button', { name: 'Marcar como em andamento' }).click()

    const emAndamento = taskSection(page, 'EM ANDAMENTO')
    const reopenedInProgress = emAndamento
      .locator('li')
      .filter({ hasText: titulo })
      .filter({ hasText: 'Vence hoje' })
    await reopenedInProgress.getByRole('button', { name: 'Marcar como concluída' }).click()

    await expect(pendentes.getByRole('heading', { name: titulo })).toHaveCount(1)
    await expect(concluidas.getByRole('heading', { name: titulo })).toHaveCount(1)
    await expect(pendentes.getByText('09/07/2026')).toBeVisible()
  })

  test('não cria próxima ocorrência quando passa de recorrencia_fim', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    const titulo = 'Tarefa com limite'

    await createRecurringTask(page, titulo, {
      data_prevista: '2026-07-02',
      tipo: 'semanal',
      recorrencia_fim: '2026-07-05',
    })

    await completeTaskViaToggle(page, titulo)

    const pendentes = taskSection(page, 'PENDENTES')
    const concluidas = taskSection(page, 'CONCLUÍDAS')

    await expect(page.getByRole('heading', { name: titulo })).toHaveCount(1)
    await expect(concluidas.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(pendentes.getByRole('heading', { name: titulo })).not.toBeVisible()
  })

  test('exige data prevista ao ativar repetição', async ({ page, authenticatedPage: _auth }) => {
    await openNewTaskModal(page)
    await page.getByLabel('Título *').fill('Tarefa sem data')
    await page.locator('#recorrencia_ativa').check()
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()

    await expect(page.getByText('Informe a data prevista para repetir a tarefa')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()
  })

  test('ao salvar como concluída no formulário, cria próxima ocorrência pendente', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    const titulo = 'Relatório semanal'

    await createRecurringTask(page, titulo, {
      data_prevista: '2026-07-02',
      tipo: 'semanal',
    })

    await editTaskDetails(page, titulo, { status: 'Concluída' })

    const pendentes = taskSection(page, 'PENDENTES')
    const concluidas = taskSection(page, 'CONCLUÍDAS')

    const concluidaCard = concluidas.locator('li').filter({ hasText: titulo })
    const pendenteCard = pendentes.locator('li').filter({ hasText: titulo })

    await expect(concluidaCard.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(concluidaCard.getByText('Concluída', { exact: true })).toBeVisible()

    await expect(pendenteCard.getByRole('heading', { name: titulo })).toBeVisible()
    await expect(pendenteCard.getByText('Pendente', { exact: true })).toBeVisible()
    await expect(pendenteCard.getByText('09/07/2026')).toBeVisible()
  })

  test('falha ao criar próxima ocorrência mantém tarefa sem concluir', async ({
    page,
    authenticatedPage: _auth,
    supabaseMock: state,
  }) => {
    const titulo = 'Reunião com falha'

    await createRecurringTask(page, titulo, {
      data_prevista: '2026-07-02',
      tipo: 'semanal',
    })

    failRestOnce(state, 'POST', 'tarefas', 'Falha ao criar próxima ocorrência')

    const card = taskCard(page, titulo).first()
    await card.getByRole('button', { name: 'Marcar como em andamento' }).click()
    await card.getByRole('button', { name: 'Marcar como concluída' }).click()

    await expect(page.getByText('Falha ao criar próxima ocorrência')).toBeVisible()
    await expect(card.getByText('Em andamento')).toBeVisible()
    await expect(card.getByText('Concluída', { exact: true })).not.toBeVisible()
    await expect(
      taskSection(page, 'EM ANDAMENTO').getByRole('heading', { name: titulo })
    ).toBeVisible()
    await expect(
      taskSection(page, 'CONCLUÍDAS').getByRole('heading', { name: titulo })
    ).not.toBeVisible()
  })
})
