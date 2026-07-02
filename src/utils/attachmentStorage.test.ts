import { makeFile } from '../test/fixtures/user'
import {
  getAttachmentPath,
  MAX_ATTACHMENT_BYTES,
  validateAttachmentFile,
} from './attachmentStorage'

describe('getAttachmentPath', () => {
  it('monta caminho userId/tarefaId/uuid.ext', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' as `${string}-${string}-${string}-${string}-${string}`
    )

    expect(getAttachmentPath('user-1', 'todo-1', 'pdf')).toBe(
      'user-1/todo-1/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf'
    )

    vi.restoreAllMocks()
  })
})

describe('validateAttachmentFile', () => {
  it('aceita MIME types permitidos', () => {
    const file = makeFile('foto.jpg', 'image/jpeg', 1024)

    expect(validateAttachmentFile(file)).toBeNull()
  })

  it('rejeita MIME type não permitido', () => {
    const file = makeFile('doc.exe', 'application/x-msdownload', 1024)

    expect(validateAttachmentFile(file)).toBe('Formato inválido. Use JPEG, PNG, WebP ou PDF.')
  })

  it('rejeita arquivo maior que 5 MB', () => {
    const file = makeFile('grande.pdf', 'application/pdf', MAX_ATTACHMENT_BYTES + 1)

    expect(validateAttachmentFile(file)).toBe('O arquivo deve ter no máximo 5 MB.')
  })

  it('aceita arquivo no limite de 5 MB', () => {
    const file = makeFile('limite.pdf', 'application/pdf', MAX_ATTACHMENT_BYTES)

    expect(validateAttachmentFile(file)).toBeNull()
  })
})
