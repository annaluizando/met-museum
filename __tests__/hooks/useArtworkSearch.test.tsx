import { renderHook, waitFor } from '@testing-library/react'
import { useArtworkSearch } from '@/lib/hooks/useArtworkSearch'
import { searchArtworks, batchGetArtworks } from '@/lib/api/artworks'
import { createWrapper, createMockArtwork } from '@/lib/utils/unit-test'

jest.mock('@/lib/api/artworks', () => ({
  searchArtworks: jest.fn(),
  batchGetArtworks: jest.fn(),
}))

const mockSearchArtworks = searchArtworks as jest.MockedFunction<typeof searchArtworks>
const mockBatchGetArtworks = batchGetArtworks as jest.MockedFunction<typeof batchGetArtworks>

describe('useArtworkSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    mockSearchArtworks.mockResolvedValue({
      total: 0,
      objectIDs: [],
    })

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh' }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch and return artworks on success', async () => {
    const mockObjectIDs = [1, 2, 3, 4, 5]
    const mockArtworks = mockObjectIDs.map(id => createMockArtwork(id, { title: `Artwork ${id}` }))

    mockSearchArtworks.mockResolvedValue({
      total: 5,
      objectIDs: mockObjectIDs,
    })
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSearchArtworks).toHaveBeenCalledWith('van gogh', undefined)
    expect(mockBatchGetArtworks).toHaveBeenCalledWith([1, 2, 3, 4, 5])
    expect(result.current.data?.pages[0].artworks).toHaveLength(5)
    expect(result.current.data?.pages[0].hasMore).toBe(false)
  })

  it('should handle pagination correctly', async () => {
    const allObjectIDs = Array.from({ length: 25 }, (_, i) => i + 1)
    const firstPageArtworks = Array.from({ length: 20 }, (_, i) => 
      createMockArtwork(i + 1, { title: `Artwork ${i + 1}` })
    )
    const secondPageArtworks = Array.from({ length: 5 }, (_, i) => 
      createMockArtwork(i + 21, { title: `Artwork ${i + 21}` })
    )

    mockSearchArtworks.mockResolvedValue({
      total: 25,
      objectIDs: allObjectIDs,
    })
    mockBatchGetArtworks
      .mockResolvedValueOnce(firstPageArtworks)
      .mockResolvedValueOnce(secondPageArtworks)

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // First page
    expect(result.current.data?.pages[0].artworks).toHaveLength(20)
    expect(result.current.data?.pages[0].hasMore).toBe(true)
    expect(result.current.data?.pages[0].nextOffset).toBe(20)

    // Fetch next page
    await result.current.fetchNextPage()

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2)
    })

    // Second page
    expect(result.current.data?.pages[1].artworks).toHaveLength(5)
    expect(result.current.data?.pages[1].hasMore).toBe(false)
  })

  it('should filter artworks with hasImages filter', async () => {
    const mockObjectIDs = [1, 2, 3]
    const mockArtworks = [
      createMockArtwork(1, { title: 'Artwork 1' }),
      { ...createMockArtwork(2, { title: 'Artwork 2' }), primaryImage: '', primaryImageSmall: '' },
      createMockArtwork(3, { title: 'Artwork 3' }),
    ]

    mockSearchArtworks.mockResolvedValue({
      total: 3,
      objectIDs: mockObjectIDs,
    })
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useArtworkSearch({ 
        query: 'van gogh',
        filters: { hasImages: true }
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const artworks = result.current.data?.pages[0].artworks || []
    expect(artworks).toHaveLength(2)
    expect(artworks.every(a => a.primaryImage || a.primaryImageSmall)).toBe(true)
  })

  it('should sort artworks with images first when hasImages filter is undefined', async () => {
    const mockArtworks = [
      { ...createMockArtwork(1, { title: 'Artwork 1' }), primaryImage: '', primaryImageSmall: '' },
      createMockArtwork(2, { title: 'Artwork 2' }),
      { ...createMockArtwork(3, { title: 'Artwork 3' }), primaryImage: '', primaryImageSmall: '' },
      createMockArtwork(4, { title: 'Artwork 4' }),
    ]

    mockSearchArtworks.mockResolvedValue({
      total: 4,
      objectIDs: [1, 2, 3, 4],
    })
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const artworks = result.current.data?.pages[0].artworks || []
    expect(artworks[0].primaryImage || artworks[0].primaryImageSmall).toBeTruthy()
    expect(artworks[1].primaryImage || artworks[1].primaryImageSmall).toBeTruthy()
    expect(artworks[2].primaryImage || artworks[2].primaryImageSmall).toBeFalsy()
    expect(artworks[3].primaryImage || artworks[3].primaryImageSmall).toBeFalsy()
  })

  it('should return empty results for empty query', () => {
    const { result } = renderHook(
      () => useArtworkSearch({ query: '' }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(mockSearchArtworks).not.toHaveBeenCalled()
    // When disabled, data will be undefined
    expect(result.current.data).toBeUndefined()
  })

  it('should return empty results when search returns no objectIDs', async () => {
    mockSearchArtworks.mockResolvedValue({
      total: 0,
      objectIDs: null,
    })

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'nonexistent' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.pages[0].artworks).toEqual([])
    expect(result.current.data?.pages[0].hasMore).toBe(false)
  })

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh', enabled: false }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(mockSearchArtworks).not.toHaveBeenCalled()
  })

  it('should pass filters to searchArtworks', async () => {
    mockSearchArtworks.mockResolvedValue({
      total: 0,
      objectIDs: [],
    })

    const filters = {
      departmentId: 1,
      isHighlight: true,
      hasImages: true,
    }

    renderHook(
      () => useArtworkSearch({ query: 'van gogh', filters }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(mockSearchArtworks).toHaveBeenCalledWith('van gogh', filters)
    })
  })

  it('should filter out null results from batchGetArtworks', async () => {
    const mockObjectIDs = [1, 2, 3]
    const mockArtworks = [
      createMockArtwork(1, { title: 'Artwork 1' }),
      null, // Failed fetch
      createMockArtwork(3, { title: 'Artwork 3' }),
    ]

    mockSearchArtworks.mockResolvedValue({
      total: 3,
      objectIDs: mockObjectIDs,
    })
    mockBatchGetArtworks.mockResolvedValue(mockArtworks)

    const { result } = renderHook(
      () => useArtworkSearch({ query: 'van gogh' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const artworks = result.current.data?.pages[0].artworks || []
    expect(artworks).toHaveLength(2)
    expect(artworks.every(a => a !== null)).toBe(true)
  })
})
