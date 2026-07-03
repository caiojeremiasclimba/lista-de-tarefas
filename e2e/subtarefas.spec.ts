import { test, expect } from './fixtures'
import { createTaskWithSubtarefas, openTaskChecklist, taskCard } from './helpers/tasks'

test.describe('Subtarefas', () => {
  test('cria tarefa com subtarefas e exibe progresso', async ({ page, authenticatedPage: _auth }) => {
    await createTaskWithSubtarefas(page, 'Projeto final', [
      'Pesquisar tema',
      'Escrever rascunho',
    ])

    const card = taskCard(page, 'Projeto final')
    await expect(card.getByText('0 de 2 subtarefas concluídas')).toBeVisible()
    await expect(card.getByText('Pesquisar tema')).not.toBeVisible()

    await openTaskChecklist(page, 'Projeto final')
    await expect(card.getByText('Pesquisar tema')).toBeVisible()
    await expect(card.getByText('Escrever rascunho')).toBeVisible()
  })

  test('marca subtarefa como concluída na checklist', async ({ page, authenticatedPage: _auth }) => {
    await createTaskWithSubtarefas(page, 'Lista de compras', ['Leite', 'Pão'])

    await openTaskChecklist(page, 'Lista de compras')
    const card = taskCard(page, 'Lista de compras')
    await card.getByRole('button', { name: 'Marcar subtarefa' }).first().click()

    await expect(card.getByText('1 de 2 subtarefas concluídas')).toBeVisible()
  })
})
