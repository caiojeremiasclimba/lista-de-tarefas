import { test, expect } from './fixtures'
import { createTask, editTask, editTaskDetails, openNewTaskModal, taskCard } from './helpers/tasks'

test.describe('Tarefas — edição', () => {
  test('edita título da tarefa e exibe toast de sucesso', async ({
    page,
    authenticatedPage: _auth,
  }) => {
    await createTask(page, 'Tarefa original')
    await editTask(page, 'Tarefa original', 'Tarefa renomeada')

    await expect(page.getByRole('heading', { name: 'Tarefa renomeada' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa original' })).not.toBeVisible()
  })

  test('exige título ao criar tarefa', async ({ page, authenticatedPage: _auth }) => {
    await openNewTaskModal(page)
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()

    await expect(page.getByText('O título é obrigatório')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()
  })

  test('cancelar edição mantém título original', async ({ page, authenticatedPage: _auth }) => {
    await createTask(page, 'Tarefa intacta')

    await taskCard(page, 'Tarefa intacta')
      .getByRole('button', { name: 'Ações da tarefa' })
      .click()
    await taskCard(page, 'Tarefa intacta').getByRole('button', { name: 'Editar' }).click()
    await page.getByLabel('Título *').fill('Título alterado')
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(page.getByRole('heading', { name: 'Tarefa intacta' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Título alterado' })).not.toBeVisible()
    await expect(page.getByText('Tarefa atualizada com sucesso.')).not.toBeVisible()
  })

  test('edita descrição e status no formulário', async ({ page, authenticatedPage: _auth }) => {
    await createTask(page, 'Tarefa completa')
    await editTaskDetails(page, 'Tarefa completa', {
      descricao: 'Descrição atualizada',
      status: 'Concluída',
    })

    const card = taskCard(page, 'Tarefa completa')
    await expect(card.getByText('Descrição atualizada')).toBeVisible()
    await expect(card.getByText('Concluída')).toBeVisible()
  })
})
