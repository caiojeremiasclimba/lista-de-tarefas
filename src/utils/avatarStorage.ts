import { supabase } from '../lib/supabase'

export const AVATAR_BUCKET = 'avatars'
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function getAvatarPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Formato inválido. Use JPEG, PNG ou WebP.'
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return 'A imagem deve ter no máximo 2 MB.'
  }
  return null
}

function getExtFromFile(file: File): string {
  return MIME_TO_EXT[file.type] ?? 'jpg'
}

function getPublicAvatarUrl(path: string): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

function extractPathFromAvatarUrl(avatarUrl: string): string | null {
  const marker = `/public/${AVATAR_BUCKET}/`
  const index = avatarUrl.indexOf(marker)
  if (index === -1) return null
  return avatarUrl.slice(index + marker.length).split('?')[0] ?? null
}

async function removeAvatarFiles(userId: string, avatarUrl?: string | null): Promise<void> {
  const paths = new Set<string>()

  if (avatarUrl) {
    const fromUrl = extractPathFromAvatarUrl(avatarUrl)
    if (fromUrl) paths.add(fromUrl)
  }

  for (const ext of AVATAR_EXTENSIONS) {
    paths.add(getAvatarPath(userId, ext))
  }

  await supabase.storage.from(AVATAR_BUCKET).remove([...paths])
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file)
  if (validationError) throw new Error(validationError)

  const ext = getExtFromFile(file)
  const path = getAvatarPath(userId, ext)

  await removeAvatarFiles(userId)

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) throw uploadError

  const publicUrl = getPublicAvatarUrl(path)

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  })

  if (updateError) throw updateError

  return publicUrl
}

export async function removeAvatar(userId: string, avatarUrl?: string | null): Promise<void> {
  await removeAvatarFiles(userId, avatarUrl)

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  })

  if (updateError) throw updateError
}
