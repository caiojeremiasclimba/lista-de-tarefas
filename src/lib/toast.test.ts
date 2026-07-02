const { mockSuccess, mockError } = vi.hoisted(() => ({
  mockSuccess: vi.fn(),
  mockError: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mockSuccess,
    error: mockError,
  },
}))

import { toast } from './toast'

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dispara toast de sucesso', () => {
    toast.success('Tarefa criada.')

    expect(mockSuccess).toHaveBeenCalledWith('Tarefa criada.')
  })

  it('dispara toast de erro', () => {
    toast.error('Erro ao salvar.')

    expect(mockError).toHaveBeenCalledWith('Erro ao salvar.')
  })
})
