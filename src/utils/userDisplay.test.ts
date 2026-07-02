import type { User } from '@supabase/supabase-js'
import { makeUser } from '../test/fixtures/user'
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitial,
  hasEmailPasswordIdentity,
} from './userDisplay'

describe('getUserDisplayName', () => {
  it('usa full_name do metadata quando disponível', () => {
    const user = makeUser({ user_metadata: { full_name: '  Maria Silva  ' } })

    expect(getUserDisplayName(user)).toBe('Maria Silva')
  })

  it('usa parte local do e-mail como fallback', () => {
    const user = makeUser({ email: 'joao@example.com', user_metadata: {} })

    expect(getUserDisplayName(user)).toBe('joao')
  })

  it('retorna "Usuário" quando não há nome nem e-mail', () => {
    const user = makeUser({ email: undefined, user_metadata: {} })

    expect(getUserDisplayName(user)).toBe('Usuário')
  })
})

describe('getUserInitial', () => {
  it('retorna primeira letra maiúscula do nome de exibição', () => {
    const user = makeUser({ user_metadata: { full_name: 'ana' } })

    expect(getUserInitial(user)).toBe('A')
  })
})

describe('getUserAvatarUrl', () => {
  it('retorna URL trimada do metadata', () => {
    const user = makeUser({
      user_metadata: { avatar_url: '  https://example.com/avatar.png  ' },
    })

    expect(getUserAvatarUrl(user)).toBe('https://example.com/avatar.png')
  })

  it('retorna null quando não há avatar', () => {
    expect(getUserAvatarUrl(makeUser())).toBeNull()
  })
})

describe('hasEmailPasswordIdentity', () => {
  it('retorna true quando há identity com provider email', () => {
    const user = makeUser({
      identities: [{ provider: 'email' }] as User['identities'],
    })

    expect(hasEmailPasswordIdentity(user)).toBe(true)
  })

  it('retorna false quando só há provider google', () => {
    const user = makeUser({
      identities: [{ provider: 'google' }] as User['identities'],
    })

    expect(hasEmailPasswordIdentity(user)).toBe(false)
  })

  it('retorna false quando identities é undefined', () => {
    const user = makeUser({ identities: undefined })

    expect(hasEmailPasswordIdentity(user)).toBe(false)
  })
})
