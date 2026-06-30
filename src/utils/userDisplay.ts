import type { User } from '@supabase/supabase-js'

export function getUserDisplayName(user: User): string {
  const nome = user.user_metadata?.full_name
  if (typeof nome === 'string' && nome.trim()) return nome.trim()
  const emailLocal = user.email?.split('@')[0]
  if (emailLocal) return emailLocal
  return 'Usuário'
}

export function getUserInitial(user: User): string {
  return getUserDisplayName(user).charAt(0).toUpperCase()
}

export function getUserAvatarUrl(user: User): string | null {
  const url = user.user_metadata?.avatar_url
  if (typeof url === 'string' && url.trim()) return url.trim()
  return null
}

export function hasEmailPasswordIdentity(user: User): boolean {
  return user.identities?.some((identity) => identity.provider === 'email') ?? false
}
