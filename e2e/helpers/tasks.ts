import { expect, type Page } from '@playwright/test'

export function taskCard(page: Page, titulo: string) {
  return page.locator('li').filter({ hasText: titulo })
}

export async function openNewTaskModal(page: Page) {
  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()
}

export async function submitNewTask(page: Page, titulo: string) {
  await openNewTaskModal(page)
  await page.getByLabel('Título *').fill(titulo)
  await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
}

export async function submitTaskEdit(page: Page, tituloAtual: string, novoTitulo: string) {
  await openEditTaskModal(page, tituloAtual)
  await page.getByLabel('Título *').fill(novoTitulo)
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
}

export async function confirmDeleteTask(page: Page, titulo: string) {
  await openTaskMenu(page, titulo)
  await taskCard(page, titulo).getByRole('button', { name: 'Excluir' }).click()
  const dialog = page.getByRole('dialog', { name: 'Excluir tarefa' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Excluir' }).click()
}

export async function createTask(page: Page, titulo: string, options?: { descricao?: string }) {
  await openNewTaskModal(page)
  await page.getByLabel('Título *').fill(titulo)
  if (options?.descricao) {
    await page.getByLabel('Descrição').fill(options.descricao)
  }
  await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
  await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()
}

export async function openTaskMenu(page: Page, titulo: string) {
  await taskCard(page, titulo).getByRole('button', { name: 'Ações da tarefa' }).click()
}

export async function editTask(page: Page, tituloAtual: string, novoTitulo: string) {
  await openTaskMenu(page, tituloAtual)
  await taskCard(page, tituloAtual).getByRole('button', { name: 'Editar' }).click()
  await expect(page.getByRole('dialog', { name: 'Editar tarefa' })).toBeVisible()
  await page.getByLabel('Título *').fill(novoTitulo)
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByText('Tarefa atualizada com sucesso.')).toBeVisible()
}

export async function expandPrioridadeFilters(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Navegação e filtros' })
  const button = nav.getByRole('button', { name: 'Por prioridade' })
  if ((await button.getAttribute('aria-expanded')) !== 'true') {
    await button.click()
  }
}

export async function filterByPrioridade(page: Page, prioridade: 'Alta' | 'Média' | 'Baixa') {
  await expandPrioridadeFilters(page)
  await navFilterButton(page, prioridade).click()
}

export async function expandStatusFilters(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Navegação e filtros' })
  const button = nav.getByRole('button', { name: 'Por status' })
  if ((await button.getAttribute('aria-expanded')) !== 'true') {
    await button.click()
  }
}

export async function filterByStatus(
  page: Page,
  status: 'Pendentes' | 'Concluídas' | 'Em andamento' | 'Canceladas'
) {
  await expandStatusFilters(page)
  await navFilterButton(page, status).click()
}

function navFilterButton(page: Page, label: string) {
  return page
    .getByRole('navigation', { name: 'Navegação e filtros' })
    .getByRole('button', { name: new RegExp(label, 'i') })
}

export async function filterByOverview(page: Page, label: 'Todas' | 'Vence hoje' | 'Vencidas') {
  await navFilterButton(page, label).click()
}

export function overviewFilterButton(page: Page, label: 'Todas' | 'Vence hoje' | 'Vencidas') {
  return navFilterButton(page, label)
}

export async function createTaskWithSubtarefas(page: Page, titulo: string, subtarefas: string[]) {
  await openNewTaskModal(page)
  await page.getByLabel('Título *').fill(titulo)

  for (const subtitulo of subtarefas) {
    await page.getByRole('button', { name: '+ Adicionar subtarefa' }).click()
    const inputs = page.getByPlaceholder('Descrição da subtarefa')
    await inputs.last().fill(subtitulo)
  }

  await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
  await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()
}

export async function openTaskChecklist(page: Page, titulo: string) {
  const card = taskCard(page, titulo)
  await card.getByRole('button', { name: 'Checklist' }).click()
}

export async function createTaskWithCategory(page: Page, titulo: string, categoriaNome: string) {
  await openNewTaskModal(page)
  await page.getByLabel('Título *').fill(titulo)
  await page.locator('#categoria_id').selectOption({ label: categoriaNome })
  await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
  await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()
}

export async function openEditTaskModal(page: Page, titulo: string) {
  await openTaskMenu(page, titulo)
  await taskCard(page, titulo).getByRole('button', { name: 'Editar' }).click()
  await expect(page.getByRole('dialog', { name: 'Editar tarefa' })).toBeVisible()
}

export async function editTaskDetails(
  page: Page,
  titulo: string,
  details: {
    descricao?: string
    status?: string
    data_prevista?: string
  }
) {
  await openEditTaskModal(page, titulo)

  if (details.descricao !== undefined) {
    await page.locator('#descricao').fill(details.descricao)
  }
  if (details.status !== undefined) {
    await page.locator('#status').selectOption({ label: details.status })
  }
  if (details.data_prevista !== undefined) {
    await page.locator('#data_prevista').fill(details.data_prevista)
  }

  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByText('Tarefa atualizada com sucesso.')).toBeVisible()
}

export function taskSection(
  page: Page,
  title: 'PENDENTES' | 'CONCLUÍDAS' | 'EM ANDAMENTO' | 'CANCELADAS' | 'VENCIDAS' | 'VENCE HOJE'
) {
  return page.locator('section').filter({
    has: page.getByRole('button').filter({ hasText: title }),
  })
}

export type RecorrenciaTipo = 'diaria' | 'semanal' | 'mensal'

export async function createRecurringTask(
  page: Page,
  titulo: string,
  options: {
    data_prevista: string
    tipo?: RecorrenciaTipo
    recorrencia_fim?: string
  }
) {
  await openNewTaskModal(page)
  await page.getByLabel('Título *').fill(titulo)
  await page.locator('#data_prevista').fill(options.data_prevista)
  await page.locator('#recorrencia_ativa').check()

  if (options.tipo) {
    await page.locator('#recorrencia_tipo').selectOption(options.tipo)
  }

  if (options.recorrencia_fim) {
    await page.locator('#recorrencia_fim').fill(options.recorrencia_fim)
  }

  await page.getByRole('button', { name: 'Adicionar tarefa' }).click()
  await expect(page.getByText('Tarefa criada com sucesso.')).toBeVisible()
}

export async function completeTaskViaToggle(page: Page, titulo: string) {
  const card = taskCard(page, titulo).first()
  await card.getByRole('button', { name: 'Marcar como em andamento' }).click()
  await card.getByRole('button', { name: 'Marcar como concluída' }).click()
}

export async function reopenCompletedTaskViaToggle(page: Page, titulo: string) {
  const concluidas = taskSection(page, 'CONCLUÍDAS')
  const card = concluidas.locator('li').filter({ hasText: titulo })
  await card.getByRole('button', { name: 'Marcar como pendente' }).click()
}
