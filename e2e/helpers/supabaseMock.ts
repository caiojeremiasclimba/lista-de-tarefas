import type { Page, Route } from '@playwright/test'

const SUPABASE_HOST = 'placeholder.supabase.co'

export const E2E_USER = {
  id: 'e2e-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@test.com',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {} as Record<string, unknown>,
  identities: [
    {
      identity_id: 'e2e-identity-id',
      id: 'e2e-identity-id',
      user_id: 'e2e-user-id',
      provider: 'email',
      created_at: '2026-01-01T00:00:00.000Z',
      last_sign_in_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

export type MockUser = typeof E2E_USER

const E2E_ACCESS_TOKEN = 'e2e-access-token'
const E2E_REFRESH_TOKEN = 'e2e-refresh-token'

export interface MockTodo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  data_prevista: string | null
  status: string
  categoria_id: string | null
  created_at: string
  completed_at: string | null
  anexo_path?: string | null
  anexo_nome?: string | null
  anexo_mime?: string | null
}

export interface MockCategoria {
  id: string
  user_id: string
  nome: string
  created_at: string
}

interface MockSubtarefa {
  id: string
  tarefa_id: string
  user_id: string
  titulo: string
  ordem: number
  concluida: boolean
}

export interface SupabaseMockState {
  todos: MockTodo[]
  categorias: MockCategoria[]
  subtarefas: MockSubtarefa[]
  user: MockUser
}

function createEmptyState(): SupabaseMockState {
  return {
    todos: [],
    categorias: [],
    subtarefas: [],
    user: structuredClone(E2E_USER),
  }
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
    body: JSON.stringify(body),
  })
}

function parseEqFilter(searchParams: URLSearchParams, column: string): string | null {
  const value = searchParams.get(column)
  if (!value?.startsWith('eq.')) return null
  return value.slice(3)
}

function parseInFilter(searchParams: URLSearchParams, column: string): string[] | null {
  const value = searchParams.get(column)
  if (!value?.startsWith('in.(') || !value.endsWith(')')) return null
  const inner = value.slice(4, -1)
  if (!inner) return []
  return inner.split(',')
}

function withSubtarefas(state: SupabaseMockState, todo: MockTodo) {
  const subtarefas = state.subtarefas
    .filter((sub) => sub.tarefa_id === todo.id)
    .sort((a, b) => a.ordem - b.ordem)
  return { ...todo, subtarefas }
}

const E2E_VALID_PASSWORD = 'senha-e2e'

function parseAuthBody(route: Route): Record<string, string> {
  const postData = route.request().postData()
  if (!postData) return {}

  try {
    const json = route.request().postDataJSON() as Record<string, string>
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v)]))
  } catch {
    return Object.fromEntries(new URLSearchParams(postData))
  }
}

function authSuccessResponse(state: SupabaseMockState) {
  return {
    access_token: E2E_ACCESS_TOKEN,
    refresh_token: E2E_REFRESH_TOKEN,
    expires_in: 3600,
    token_type: 'bearer',
    user: state.user,
  }
}

function handleAuth(route: Route, url: URL, state: SupabaseMockState) {
  const method = route.request().method()

  if (method === 'OPTIONS') {
    return json(route, {})
  }

  if (url.pathname === '/auth/v1/token' && method === 'POST') {
    const body = parseAuthBody(route)
    const grantType = url.searchParams.get('grant_type') ?? body.grant_type

    if (grantType === 'password' && body.password !== E2E_VALID_PASSWORD) {
      return json(
        route,
        { error: 'invalid_grant', error_description: 'Invalid login credentials' },
        400
      )
    }

    return json(route, authSuccessResponse(state))
  }

  if (url.pathname === '/auth/v1/signup' && method === 'POST') {
    const body = parseAuthBody(route)
    const email = body.email ?? 'novo@test.com'
    const newUser: MockUser = {
      ...structuredClone(E2E_USER),
      id: crypto.randomUUID(),
      email,
      user_metadata: {},
    }
    state.user = newUser

    return json(route, {
      ...authSuccessResponse(state),
      user: newUser,
    })
  }

  if (url.pathname === '/auth/v1/recover' && method === 'POST') {
    return json(route, {})
  }

  if (url.pathname === '/auth/v1/user' && method === 'GET') {
    const auth = route.request().headers()['authorization']
    if (!auth?.startsWith('Bearer ')) {
      return json(route, { message: 'JWT expired' }, 401)
    }
    return json(route, state.user)
  }

  if (url.pathname === '/auth/v1/user' && method === 'PUT') {
    const auth = route.request().headers()['authorization']
    if (!auth?.startsWith('Bearer ')) {
      return json(route, { message: 'JWT expired' }, 401)
    }

    const body = route.request().postDataJSON() as {
      data?: Record<string, unknown>
      password?: string
    }

    if (body.data) {
      state.user = {
        ...state.user,
        user_metadata: { ...state.user.user_metadata, ...body.data },
        updated_at: new Date().toISOString(),
      }
    }

    return json(route, { user: state.user })
  }

  if (url.pathname === '/auth/v1/logout' && method === 'POST') {
    return json(route, {})
  }

  return json(route, { message: `Auth mock não implementado: ${method} ${url.pathname}` }, 404)
}

function handleRest(route: Route, url: URL, state: SupabaseMockState) {
  const method = route.request().method()

  if (method === 'OPTIONS') {
    return json(route, {})
  }

  const table = url.pathname.replace('/rest/v1/', '')
  const params = url.searchParams
  const wantsSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object+json')

  if (table === 'rpc/delete_categoria_com_tarefas' && method === 'POST') {
    const body = route.request().postDataJSON() as { p_categoria_id?: string }
    const categoriaId = body.p_categoria_id
    if (!categoriaId) return json(route, { message: 'Missing p_categoria_id' }, 400)

    state.todos = state.todos.map((todo) =>
      todo.categoria_id === categoriaId ? { ...todo, categoria_id: null } : todo
    )
    state.categorias = state.categorias.filter((cat) => cat.id !== categoriaId)
    return json(route, null)
  }

  if (table === 'tarefas') {
    if (method === 'GET') {
      const id = parseEqFilter(params, 'id')
      const todos = [...state.todos].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      if (id) {
        const todo = todos.find((item) => item.id === id)
        if (!todo) return json(route, { message: 'Not found' }, 404)
        return json(route, withSubtarefas(state, todo))
      }

      return json(
        route,
        todos.map((todo) => withSubtarefas(state, todo))
      )
    }

    if (method === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      const created: MockTodo = {
        id: crypto.randomUUID(),
        user_id: String(body.user_id ?? E2E_USER.id),
        titulo: String(body.titulo ?? ''),
        descricao: (body.descricao as string | null) ?? null,
        data_prevista: (body.data_prevista as string | null) ?? null,
        status: String(body.status ?? 'pendente'),
        categoria_id: (body.categoria_id as string | null) ?? null,
        created_at: new Date().toISOString(),
        completed_at: (body.completed_at as string | null) ?? null,
        anexo_path: null,
        anexo_nome: null,
        anexo_mime: null,
      }
      state.todos.push(created)
      return json(route, created)
    }

    if (method === 'PATCH') {
      const id = parseEqFilter(params, 'id')
      const categoriaId = parseEqFilter(params, 'categoria_id')
      const body = route.request().postDataJSON() as Record<string, unknown>

      if (categoriaId) {
        state.todos = state.todos.map((todo) =>
          todo.categoria_id === categoriaId ? { ...todo, categoria_id: null } : todo
        )
        return json(route, null, 204)
      }

      if (!id) return json(route, { message: 'Missing id filter' }, 400)

      const index = state.todos.findIndex((todo) => todo.id === id)
      if (index === -1) return json(route, { message: 'Not found' }, 404)

      const updated: MockTodo = {
        ...state.todos[index],
        ...body,
      } as MockTodo
      state.todos[index] = updated

      if (wantsSingle) return json(route, updated)
      return json(route, [updated])
    }

    if (method === 'DELETE') {
      const id = parseEqFilter(params, 'id')
      if (!id) return json(route, { message: 'Missing id filter' }, 400)
      state.todos = state.todos.filter((todo) => todo.id !== id)
      state.subtarefas = state.subtarefas.filter((sub) => sub.tarefa_id !== id)
      return json(route, null, 204)
    }
  }

  if (table === 'categorias') {
    if (method === 'GET') {
      const sorted = [...state.categorias].sort((a, b) => a.nome.localeCompare(b.nome))
      return json(route, sorted)
    }

    if (method === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      const created: MockCategoria = {
        id: crypto.randomUUID(),
        user_id: String(body.user_id ?? E2E_USER.id),
        nome: String(body.nome ?? ''),
        created_at: new Date().toISOString(),
      }
      state.categorias.push(created)
      return json(route, created)
    }

    if (method === 'PATCH') {
      const id = parseEqFilter(params, 'id')
      if (!id) return json(route, { message: 'Missing id filter' }, 400)
      const body = route.request().postDataJSON() as Record<string, unknown>
      const index = state.categorias.findIndex((cat) => cat.id === id)
      if (index === -1) return json(route, { message: 'Not found' }, 404)
      state.categorias[index] = { ...state.categorias[index], ...body } as MockCategoria
      return json(route, state.categorias[index])
    }

    if (method === 'DELETE') {
      const id = parseEqFilter(params, 'id')
      if (!id) return json(route, { message: 'Missing id filter' }, 400)
      state.categorias = state.categorias.filter((cat) => cat.id !== id)
      return json(route, null, 204)
    }
  }

  if (table === 'subtarefas') {
    if (method === 'GET') {
      const tarefaId = parseEqFilter(params, 'tarefa_id')
      const items = state.subtarefas.filter((sub) => (tarefaId ? sub.tarefa_id === tarefaId : true))
      return json(route, items)
    }

    if (method === 'POST') {
      const body = route.request().postDataJSON()
      const rows = Array.isArray(body) ? body : [body]
      const created = rows.map((row, index) => {
        const item = row as Record<string, unknown>
        const subtarefa: MockSubtarefa = {
          id: String(item.id ?? crypto.randomUUID()),
          tarefa_id: String(item.tarefa_id),
          user_id: String(item.user_id ?? E2E_USER.id),
          titulo: String(item.titulo ?? ''),
          ordem: Number(item.ordem ?? index),
          concluida: Boolean(item.concluida ?? false),
        }
        state.subtarefas.push(subtarefa)
        return subtarefa
      })
      return json(route, created)
    }

    if (method === 'PATCH') {
      const id = parseEqFilter(params, 'id')
      if (!id) return json(route, { message: 'Missing id filter' }, 400)
      const body = route.request().postDataJSON() as Record<string, unknown>
      const index = state.subtarefas.findIndex((sub) => sub.id === id)
      if (index === -1) return json(route, { message: 'Not found' }, 404)
      state.subtarefas[index] = { ...state.subtarefas[index], ...body } as MockSubtarefa
      return json(route, state.subtarefas[index])
    }

    if (method === 'DELETE') {
      const idFilter = parseEqFilter(params, 'id')
      const inFilter = parseInFilter(params, 'id')

      if (inFilter) {
        state.subtarefas = state.subtarefas.filter((sub) => !inFilter.includes(sub.id))
        return json(route, null, 204)
      }

      if (idFilter) {
        state.subtarefas = state.subtarefas.filter((sub) => sub.id !== idFilter)
        return json(route, null, 204)
      }

      return json(route, { message: 'Missing id filter' }, 400)
    }
  }

  return json(route, { message: `REST mock não implementado: ${method} ${table}` }, 404)
}

export async function setupSupabaseMock(
  page: Page,
  initialState: Partial<SupabaseMockState> = {}
): Promise<SupabaseMockState> {
  const state: SupabaseMockState = {
    ...createEmptyState(),
    ...initialState,
    todos: [...(initialState.todos ?? [])],
    categorias: [...(initialState.categorias ?? [])],
    subtarefas: [...(initialState.subtarefas ?? [])],
    user: initialState.user ? structuredClone(initialState.user) : structuredClone(E2E_USER),
  }

  await page.route(`**://${SUPABASE_HOST}/**`, async (route) => {
    const url = new URL(route.request().url())

    if (url.pathname.startsWith('/auth/v1/')) {
      await handleAuth(route, url, state)
      return
    }

    if (url.pathname.startsWith('/rest/v1/')) {
      await handleRest(route, url, state)
      return
    }

    await json(route, { message: `Mock não implementado: ${url.pathname}` }, 404)
  })

  return state
}

export async function login(page: Page) {
  await page.goto('/')
  await page.getByLabel('E-mail').fill(E2E_USER.email)
  await page.getByLabel('Senha', { exact: true }).fill('senha-e2e')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.getByRole('button', { name: 'Nova tarefa' }).waitFor({ state: 'visible' })
}
