import { test as base } from '@playwright/test'
import {
  CANCELLED_TODOS,
  DUE_TODAY_TODOS,
  MIXED_PRIORITY_TODOS,
  MIXED_STATUS_TODOS,
  OVERDUE_CATEGORY_TODOS,
  OVERDUE_EM_ANDAMENTO_TODOS,
  OVERDUE_TODOS,
  SEED_CATEGORIAS,
  SEED_TODOS_WITH_CATEGORIES,
  SORTABLE_DUE_TODAY_TODOS,
  SORTABLE_OVERDUE_TODOS,
  SORTABLE_TODOS,
} from './helpers/seed'
import { login, setupSupabaseMock, type SupabaseMockState } from './helpers/supabaseMock'

type Fixtures = {
  supabaseMock: SupabaseMockState
  authenticatedPage: void
  authenticatedWithMixedTasks: SupabaseMockState
  authenticatedWithCategories: SupabaseMockState
  authenticatedWithOverdueTasks: SupabaseMockState
  authenticatedWithDueTodayTasks: SupabaseMockState
  authenticatedWithCancelledTasks: SupabaseMockState
  authenticatedWithMixedPriorities: SupabaseMockState
  authenticatedWithSortableTasks: SupabaseMockState
  authenticatedWithSortableOverdueTasks: SupabaseMockState
  authenticatedWithSortableDueTodayTasks: SupabaseMockState
  authenticatedWithOverdueEmAndamentoTasks: SupabaseMockState
  authenticatedWithOverdueCategoryTasks: SupabaseMockState
}

export const test = base.extend<Fixtures>({
  supabaseMock: async ({ page }, use) => {
    const state = await setupSupabaseMock(page)
    await use(state)
  },

  authenticatedPage: async ({ page, supabaseMock: _state }, use) => {
    await login(page)
    await use()
  },

  authenticatedWithMixedTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: MIXED_STATUS_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithCategories: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, {
      categorias: SEED_CATEGORIAS,
      todos: SEED_TODOS_WITH_CATEGORIES,
    })
    await login(page)
    await use(state)
  },

  authenticatedWithOverdueTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: OVERDUE_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithDueTodayTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: DUE_TODAY_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithCancelledTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: CANCELLED_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithMixedPriorities: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: MIXED_PRIORITY_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithSortableTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: SORTABLE_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithSortableOverdueTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: SORTABLE_OVERDUE_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithSortableDueTodayTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: SORTABLE_DUE_TODAY_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithOverdueEmAndamentoTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, { todos: OVERDUE_EM_ANDAMENTO_TODOS })
    await login(page)
    await use(state)
  },

  authenticatedWithOverdueCategoryTasks: async ({ page }, use) => {
    const state = await setupSupabaseMock(page, {
      categorias: SEED_CATEGORIAS,
      todos: OVERDUE_CATEGORY_TODOS,
    })
    await login(page)
    await use(state)
  },
})
export { expect } from '@playwright/test'
