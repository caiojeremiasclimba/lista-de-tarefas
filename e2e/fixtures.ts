import { test as base } from '@playwright/test'
import { login, setupSupabaseMock, type SupabaseMockState } from './helpers/supabaseMock'

type Fixtures = {
  supabaseMock: SupabaseMockState
  authenticatedPage: void
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
})

export { expect } from '@playwright/test'
