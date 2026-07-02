import { supabase } from '../lib/supabase'

export const ATTACHMENT_BUCKET = 'task-attachments'
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
export const SIGNED_URL_EXPIRES_SECONDS = 3600
export const SIGNED_URL_REFRESH_MARGIN_SECONDS = 300

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export interface AttachmentMetadata {
  path: string
  nome: string
  mime: string
}

export function getAttachmentPath(userId: string, tarefaId: string, ext: string): string {
  return `${userId}/${tarefaId}/${crypto.randomUUID()}.${ext}`
}

export function validateAttachmentFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Formato inválido. Use JPEG, PNG, WebP ou PDF.'
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return 'O arquivo deve ter no máximo 5 MB.'
  }
  return null
}

function getExtFromFile(file: File): string {
  return MIME_TO_EXT[file.type] ?? 'bin'
}

export async function uploadAttachment(
  userId: string,
  tarefaId: string,
  file: File
): Promise<AttachmentMetadata> {
  const validationError = validateAttachmentFile(file)
  if (validationError) throw new Error(validationError)

  const ext = getExtFromFile(file)
  const path = getAttachmentPath(userId, tarefaId, ext)

  const { error: uploadError } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, {
    contentType: file.type,
  })

  if (uploadError) throw uploadError

  return {
    path,
    nome: file.name,
    mime: file.type,
  }
}

export async function removeAttachment(path: string | null | undefined): Promise<void> {
  if (!path) return

  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).remove([path])

  if (error) throw error
}

export async function getAttachmentSignedUrl(
  path: string,
  expiresIn = SIGNED_URL_EXPIRES_SECONDS
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  if (!data?.signedUrl) throw new Error('Não foi possível gerar URL do anexo.')

  return data.signedUrl
}

export const ATTACHMENT_DB_FIELDS = {
  anexo_path: null,
  anexo_nome: null,
  anexo_mime: null,
} as const
