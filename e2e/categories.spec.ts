import { test, expect } from './fixtures'
import {
  cancelDeleteCategory,
  createCategory,
  deleteCategory,
  editCategory,
  expandCategoryFilters,
  filterByCategory,
} from './helpers/categories'
import { createTaskWithCategory } from './helpers/tasks'

test.describe('Categorias', () => {
  test('cria categoria pela sidebar', async ({ page, authenticatedPage: _auth }) => {
    await createCategory(page, 'Estudos')
    await expandCategoryFilters(page)

    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Estudos\s+\d/i })
    ).toBeVisible()
  })

  test('filtra tarefas por categoria', async ({ page, authenticatedWithCategories: _state }) => {
    await filterByCategory(page, 'Trabalho')

    await expect(page.getByRole('heading', { name: 'Reunião de equipe' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprar presente' })).not.toBeVisible()
  })

  test('associa categoria ao criar tarefa', async ({ page, authenticatedPage: _auth }) => {
    await createCategory(page, 'Finanças')
    await createTaskWithCategory(page, 'Pagar contas', 'Finanças')

    const card = page.locator('li').filter({ hasText: 'Pagar contas' })
    await expect(card.getByText('Finanças')).toBeVisible()
  })

  test('edita nome da categoria', async ({ page, authenticatedWithCategories: _state }) => {
    await editCategory(page, 'Trabalho', 'Trabalho remoto')
    await expandCategoryFilters(page)

    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Trabalho remoto\s+\d/i })
    ).toBeVisible()
  })

  test('exclui categoria após confirmação', async ({ page, authenticatedWithCategories: _state }) => {
    await deleteCategory(page, 'Pessoal')
    await expandCategoryFilters(page)

    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Pessoal\s+\d/i })
    ).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprar presente' })).toBeVisible()
  })

  test('exige nome ao criar categoria', async ({ page, authenticatedPage: _auth }) => {
    await page
      .getByRole('navigation', { name: 'Navegação e filtros' })
      .getByRole('button', { name: 'Por categoria' })
      .click()
    await page.getByRole('button', { name: 'Nova categoria' }).click()
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Informe o nome da categoria.')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
  })

  test('cancelar exclusão mantém a categoria', async ({
    page,
    authenticatedWithCategories: _state,
  }) => {
    await cancelDeleteCategory(page, 'Pessoal')
    await expandCategoryFilters(page)

    await expect(
      page
        .getByRole('navigation', { name: 'Navegação e filtros' })
        .getByRole('button', { name: /^Pessoal\s+\d/i })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprar presente' })).toBeVisible()
    await expect(page.getByText('Categoria excluída com sucesso.')).not.toBeVisible()
  })
})
