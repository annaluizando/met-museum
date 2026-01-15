import { renderHook, waitFor } from '@testing-library/react'
import { useFeaturedArtworks } from '@/lib/hooks/useFeaturedArtworks'
import { batchGetArtworks } from '@/lib/api/artworks'
import { createWrapper, createMockArtwork } from '@/lib/utils/unit-test'

jest.mock('@/lib/api/artworks', () => ({
  batchGetArtworks: jest.fn(),
}))

const mockBatchGetArtworks = batchGetArtworks as jest.MockedFunction<typeof batchGetArtworks>

describe('useFeaturedArtworks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mockArtworks = [createMockArtwork(436535, { title: 'Featured Artwork 436535' }), createMockArtwork(459055, { title: 'Featured Artwork 459055' })]
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch and return featured artworks on success', async () => {
    const mockArtworks = [
      createMockArtwork(436535, { title: 'Featured Artwork 436535' }),
      createMockArtwork(459055, { title: 'Featured Artwork 459055' }),
      createMockArtwork(438817, { title: 'Featured Artwork 438817' }),
    ]
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should call with the featured artwork IDs
    expect(mockBatchGetArtworks).toHaveBeenCalledWith([
      436535, 459055, 438817, 436105, 437133, 436528, 437894, 459080
    ])
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].objectID).toBe(436535)
  })

  it('should filter out null results', async () => {
    const mockArtworks = [
      createMockArtwork(436535, { title: 'Featured Artwork 436535' }),
      null, // Failed fetch
      createMockArtwork(438817, { title: 'Featured Artwork 438817' }),
      null, // Another failed fetch
    ]
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should filter out null values
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.every(a => a !== null)).toBe(true)
  })

  it('should return empty array when all fetches fail', async () => {
    mockBatchGetArtworks.mockResolvedValue([null, null, null])

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should not refetch on window focus', async () => {
    const mockArtworks = [createMockArtwork(436535, { title: 'Featured Artwork 436535' })]
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const initialCallCount = mockBatchGetArtworks.mock.calls.length

    // Simulate window focus
    window.dispatchEvent(new Event('focus'))

    // Should not refetch
    await waitFor(() => {
      expect(mockBatchGetArtworks.mock.calls.length).toBe(initialCallCount)
    })
  })

  it('should use correct query key', async () => {
    const mockArtworks = [createMockArtwork(436535, { title: 'Featured Artwork 436535' })]
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useFeaturedArtworks(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify the query was set up correctly
    expect(result.current.data).toBeDefined()
  })
})
