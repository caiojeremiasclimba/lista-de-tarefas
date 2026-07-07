import { renderHook } from '@testing-library/react'
import { useSupabaseRealtime } from './useSupabaseRealtime'

const { mockChannelOn, mockSubscribe, mockRemoveChannel, mockChannel } = vi.hoisted(() => {
  const mockChannelOn = vi.fn()
  const mockSubscribe = vi.fn()
  const mockRemoveChannel = vi.fn()

  function createChannel() {
    return {
      on: (...args: unknown[]) => {
        mockChannelOn(...args)
        return createChannel()
      },
      subscribe: mockSubscribe,
    }
  }

  const mockChannel = vi.fn(createChannel)

  return { mockChannelOn, mockSubscribe, mockRemoveChannel, mockChannel }
})

vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}))

describe('useSupabaseRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inscreve nas tabelas com filtro por usuário', () => {
    const onChange = vi.fn()

    renderHook(() => useSupabaseRealtime('user-1', ['tarefas', 'subtarefas'], onChange))

    expect(mockChannel).toHaveBeenCalledWith('realtime:user-1:tarefas,subtarefas')
    expect(mockChannelOn).toHaveBeenCalledTimes(2)
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('não inscreve sem userId', () => {
    renderHook(() => useSupabaseRealtime(undefined, ['tarefas'], vi.fn()))

    expect(mockChannel).not.toHaveBeenCalled()
  })

  it('remove canal ao desmontar', () => {
    const channel = createChannel()
    mockChannel.mockReturnValueOnce(channel)

    const { unmount } = renderHook(() => useSupabaseRealtime('user-1', ['categorias'], vi.fn()))

    unmount()

    expect(mockRemoveChannel).toHaveBeenCalledWith(channel)
  })

  it('dispara callback com payload do evento', () => {
    const onChange = vi.fn()

    renderHook(() => useSupabaseRealtime('user-1', ['tarefas'], onChange))

    const handler = mockChannelOn.mock.calls[0]?.[2] as ((payload: unknown) => void) | undefined
    handler?.({
      eventType: 'UPDATE',
      new: { id: 'todo-1' },
      old: { id: 'todo-1' },
    })

    expect(onChange).toHaveBeenCalledWith({
      table: 'tarefas',
      eventType: 'UPDATE',
      new: { id: 'todo-1' },
      old: { id: 'todo-1' },
    })
  })

  it('debounce múltiplos eventos quando debounceMs está configurado', () => {
    const onChange = vi.fn()

    renderHook(() => useSupabaseRealtime('user-1', ['tarefas'], onChange, { debounceMs: 300 }))

    const handler = mockChannelOn.mock.calls[0]?.[2] as ((payload: unknown) => void) | undefined
    handler?.({ eventType: 'INSERT', new: { id: '1' }, old: undefined })
    handler?.({ eventType: 'UPDATE', new: { id: '1' }, old: { id: '1' } })

    expect(onChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      table: 'tarefas',
      eventType: 'UPDATE',
      new: { id: '1' },
      old: { id: '1' },
    })
  })
})

function createChannel() {
  return {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  }
}
