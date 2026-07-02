import { act, renderHook, waitFor } from '@testing-library/react'
import { useAttachmentSignedUrl } from './useAttachmentSignedUrl'

const mockGetAttachmentSignedUrl = vi.hoisted(() => vi.fn())

vi.mock('../utils/attachmentStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/attachmentStorage')>()
  return {
    ...actual,
    getAttachmentSignedUrl: mockGetAttachmentSignedUrl,
  }
})

describe('useAttachmentSignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAttachmentSignedUrl.mockResolvedValue('https://signed.example/file.pdf')
  })

  it('mantém url null quando path é vazio', () => {
    const { result } = renderHook(() => useAttachmentSignedUrl(null))

    expect(result.current.url).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(false)
    expect(mockGetAttachmentSignedUrl).not.toHaveBeenCalled()
  })

  it('busca URL assinada quando path é informado', async () => {
    const { result } = renderHook(() => useAttachmentSignedUrl('user/todo/file.pdf'))

    await waitFor(() => expect(result.current.url).toBe('https://signed.example/file.pdf'))

    expect(mockGetAttachmentSignedUrl).toHaveBeenCalledWith('user/todo/file.pdf')
    expect(result.current.error).toBe(false)
  })

  it('marca erro quando fetch falha', async () => {
    mockGetAttachmentSignedUrl.mockRejectedValue(new Error('Falha'))

    const { result } = renderHook(() => useAttachmentSignedUrl('user/todo/file.pdf'))

    await waitFor(() => expect(result.current.error).toBe(true))

    expect(result.current.url).toBeNull()
  })

  it('retry busca URL novamente após erro', async () => {
    mockGetAttachmentSignedUrl
      .mockRejectedValueOnce(new Error('Falha'))
      .mockResolvedValueOnce('https://signed.example/retry.pdf')

    const { result } = renderHook(() => useAttachmentSignedUrl('user/todo/file.pdf'))

    await waitFor(() => expect(result.current.error).toBe(true))

    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.url).toBe('https://signed.example/retry.pdf'))

    expect(result.current.error).toBe(false)
  })

  it('openInNewTab abre URL assinada em nova aba', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const { result } = renderHook(() => useAttachmentSignedUrl('user/todo/file.pdf'))
    await waitFor(() => expect(result.current.url).not.toBeNull())

    await act(async () => {
      await result.current.openInNewTab()
    })

    expect(openSpy).toHaveBeenCalledWith(
      'https://signed.example/file.pdf',
      '_blank',
      'noopener,noreferrer'
    )

    openSpy.mockRestore()
  })
})
