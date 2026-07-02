import type { User } from '@supabase/supabase-js'

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'joao@example.com',
    user_metadata: {},
    identities: [],
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as User
}

export function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}
