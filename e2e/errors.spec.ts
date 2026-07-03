import { test, expect } from './fixtures'
import {
  confirmDeleteCategory,
  expandCategoryFilters,
  submitCategoryEdit,
  submitNewCategory,
} from './helpers/categories'
import {
  confirmDeleteTask,
  createTask,
  createTaskWithSubtarefas,
  openNewTaskModal,
  openTaskChecklist,
  submitNewTask,
  submitTaskEdit,
  taskCard,
} from './helpers/tasks'
import { failRestOnce, login } from './helpers/supabaseMock'

test.describe('Erros — tarefas', () => {
  test('falha ao criar tarefa mantém formulário aberto com erro inline', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    failRestOnce(state, 'POST', 'tarefas', 'Falha ao salvar tarefa')

    await submitNewTask(page, 'Tarefa com erro')

    await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()
    await expect(page.getByText('Falha ao salvar tarefa')).toBeVisible()
    await expect(page.getByText('Tarefa criada com sucesso.')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa com erro' })).not.toBeVisible()
  })

  test('falha ao editar tarefa mantém formulário aberto com erro inline', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    await createTask(page, 'Tarefa original')

    failRestOnce(state, 'PATCH', 'tarefas', 'Falha ao atualizar tarefa')
    await submitTaskEdit(page, 'Tarefa original', 'Tarefa alterada')

    await expect(page.getByRole('dialog', { name: 'Editar tarefa' })).toBeVisible()
    await expect(page.getByText('Falha ao atualizar tarefa')).toBeVisible()
    await expect(page.getByText('Tarefa atualizada com sucesso.')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa original' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa alterada' })).not.toBeVisible()
  })

  test('falha ao excluir tarefa exibe toast e mantém a tarefa na lista', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    await createTask(page, 'Tarefa persistente')

    failRestOnce(state, 'DELETE', 'tarefas', 'Falha ao excluir tarefa')
    await confirmDeleteTask(page, 'Tarefa persistente')

    await expect(page.getByText('Falha ao excluir tarefa')).toBeVisible()
    await expect(page.getByText('Tarefa excluída com sucesso.')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefa persistente' })).toBeVisible()
  })

  test('falha ao alterar status exibe toast e mantém status original', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    await createTask(page, 'Tarefa de status')

    failRestOnce(state, 'PATCH', 'tarefas', 'Falha ao atualizar status')
    const card = taskCard(page, 'Tarefa de status')
    await card.getByRole('button', { name: 'Marcar como em andamento' }).click()

    await expect(page.getByText('Falha ao atualizar status')).toBeVisible()
    await expect(card.getByText('Pendente')).toBeVisible()
    await expect(card.getByText('Em andamento')).not.toBeVisible()
  })
})

test.describe('Erros — categorias', () => {
  test('falha ao criar categoria mantém formulário aberto com erro inline', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    failRestOnce(state, 'POST', 'categorias', 'Falha ao criar categoria')

    await submitNewCategory(page, 'Categoria com erro')

    await expect(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
    await expect(page.getByText('Falha ao criar categoria')).toBeVisible()
    await expect(page.getByText('Categoria criada com sucesso.')).not.toBeVisible()
  })

  test('falha ao editar categoria mantém formulário aberto com erro inline', async ({
    page,
    authenticatedWithCategories: state,
  }) => {
    failRestOnce(state, 'PATCH', 'categorias', 'Falha ao atualizar categoria')
    await submitCategoryEdit(page, 'Trabalho', 'Trabalho remoto')

    await expect(page.getByRole('dialog', { name: 'Editar categoria' })).toBeVisible()
    await expect(page.getByText('Falha ao atualizar categoria')).toBeVisible()
    await expect(page.getByText('Categoria atualizada com sucesso.')).not.toBeVisible()
    await expandCategoryFilters(page)
    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Trabalho\s+\d/i })
    ).toBeVisible()
  })

  test('falha ao excluir categoria exibe toast e mantém a categoria', async ({
    page,
    authenticatedWithCategories: state,
  }) => {
    failRestOnce(state, 'POST', 'rpc/delete_categoria_com_tarefas', 'Falha ao excluir categoria')
    await confirmDeleteCategory(page, 'Pessoal')

    await expect(page.getByText('Falha ao excluir categoria')).toBeVisible()
    await expect(page.getByText('Categoria excluída com sucesso.')).not.toBeVisible()
    await expandCategoryFilters(page)
    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Pessoal\s+\d/i })
    ).toBeVisible()
  })
})

test.describe('Erros — subtarefas', () => {
  test('falha ao marcar subtarefa exibe toast e mantém estado', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    await createTaskWithSubtarefas(page, 'Lista de compras', ['Leite'])

    failRestOnce(state, 'PATCH', 'subtarefas', 'Falha ao atualizar subtarefa')
    const card = taskCard(page, 'Lista de compras')
    await openTaskChecklist(page, 'Lista de compras')
    await card.getByRole('button', { name: 'Marcar subtarefa' }).click()

    await expect(page.getByText('Falha ao atualizar subtarefa')).toBeVisible()
    await expect(card.getByText('0 de 1 subtarefas concluídas')).toBeVisible()
  })

  test('falha ao salvar subtarefas mantém formulário aberto com erro inline', async ({
    page,
    supabaseMock: state,
  }) => {
    await login(page)
    failRestOnce(state, 'POST', 'subtarefas', 'Falha ao salvar subtarefas')

    await openNewTaskModal(page)
    await page.getByLabel('Título *').fill('Projeto com subtarefas')
    await page.getByRole('button', { name: '+ Adicionar subtarefa' }).click()
    await page.getByPlaceholder('Descrição da subtarefa').fill('Primeira etapa')
    await page.getByRole('button', { name: 'Adicionar tarefa' }).click()

    await expect(page.getByRole('dialog', { name: 'Nova tarefa' })).toBeVisible()
    await expect(page.getByText('Falha ao salvar subtarefas')).toBeVisible()
    await expect(page.getByText('Tarefa criada com sucesso.')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Projeto com subtarefas' })).not.toBeVisible()
  })
})
