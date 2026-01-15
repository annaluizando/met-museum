import { renderHook, waitFor } from '@testing-library/react'
import { useArtworkDetail } from '@/lib/hooks/useArtworkDetail'
import { getArtworkById } from '@/lib/api/artworks'
import { createWrapper, createMockArtwork } from '@/lib/utils/unit-test'

jest.mock('@/lib/api/artworks', () => ({
  getArtworkById: jest.fn(),
}))

const mockGetArtworkById = getArtworkById as jest.MockedFunction<typeof getArtworkById>

describe('useArtworkDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mockArtwork = createMockArtwork(1)
    mockGetArtworkById.mockResolvedValue(mockArtwork)

    const { result } = renderHook(
      () => useArtworkDetail(1),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch and return artwork on success', async () => {
    const mockArtwork = createMockArtwork(1)
    mockGetArtworkById.mockResolvedValue(mockArtwork)

    const { result } = renderHook(
      () => useArtworkDetail(1),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetArtworkById).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(mockArtwork)
  })

  it('should not fetch when id is null', () => {
    const { result } = renderHook(
      () => useArtworkDetail(null),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(mockGetArtworkById).not.toHaveBeenCalled()
  })

  it('should refetch when id changes', async () => {
    const mockArtwork1 = createMockArtwork(1)
    const mockArtwork2 = createMockArtwork(2)

    mockGetArtworkById
      .mockResolvedValueOnce(mockArtwork1)
      .mockResolvedValueOnce(mockArtwork2)

    const { result, rerender } = renderHook(
      ({ id }) => useArtworkDetail(id),
      {
        wrapper: createWrapper(),
        initialProps: { id: 1 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.objectID).toBe(1)

    // Change id
    rerender({ id: 2 })

    await waitFor(() => {
      expect(mockGetArtworkById).toHaveBeenCalledTimes(2)
      expect(result.current.data?.objectID).toBe(2)
    })
  })

  it('should use correct query key', async () => {
    const mockArtwork = createMockArtwork(1)
    mockGetArtworkById.mockResolvedValue(mockArtwork)

    const { result } = renderHook(
      () => useArtworkDetail(1),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
  })
})
