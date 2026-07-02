import { vi } from 'vitest'

export type MockQueryResult = {
  data?: unknown
  error?: { message: string } | null
}

export function createMockQueryBuilder(result: MockQueryResult = { data: null, error: null }) {
  const resolved = { data: result.data ?? null, error: result.error ?? null }

  const builder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(async () => resolved),
    then(
      onFulfilled?: (value: typeof resolved) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) {
      return Promise.resolve(resolved).then(onFulfilled, onRejected)
    },
  }

  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.in.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)

  return builder
}

const supabaseMocks = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockChannel: vi.fn(),
  mockRemoveChannel: vi.fn(),
}))

export const mockFrom = supabaseMocks.mockFrom
export const mockGetUser = supabaseMocks.mockGetUser
export const mockRpc = supabaseMocks.mockRpc
export const mockChannel = supabaseMocks.mockChannel
export const mockRemoveChannel = supabaseMocks.mockRemoveChannel

function createMockRealtimeChannel() {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  }
  mockChannel.mockReturnValue(channel)
  return channel
}

export { createMockRealtimeChannel }

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.mockFrom,
    rpc: supabaseMocks.mockRpc,
    auth: { getUser: supabaseMocks.mockGetUser },
    channel: supabaseMocks.mockChannel,
    removeChannel: supabaseMocks.mockRemoveChannel,
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({ error: null })),
        remove: vi.fn(async () => ({ error: null })),
        createSignedUrl: vi.fn(async () => ({
          data: { signedUrl: 'https://signed.example/file' },
          error: null,
        })),
      })),
    },
  },
}))

export const AUTH_USER = { id: 'user-1', email: 'user@example.com' }

export function mockAuthenticatedUser() {
  mockGetUser.mockResolvedValue({ data: { user: AUTH_USER }, error: null })
}

export function mockUnauthenticatedUser() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
}
