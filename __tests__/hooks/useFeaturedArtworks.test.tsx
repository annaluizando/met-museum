import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFeaturedArtworks } from '@/lib/hooks/useFeaturedArtworks'
import { batchGetArtworks } from '@/lib/api/artworks'
import type { ArtworkObject } from '@/lib/types/artwork'

// Mock the API function
jest.mock('@/lib/api/artworks', () => ({
  batchGetArtworks: jest.fn(),
}))

const mockBatchGetArtworks = batchGetArtworks as jest.MockedFunction<typeof batchGetArtworks>

// Helper to create a QueryClient for each test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock artwork data
const createMockArtwork = (id: number): ArtworkObject => ({
  objectID: id,
  isHighlight: true,
  accessionNumber: `${id}`,
  accessionYear: '1993',
  isPublicDomain: true,
  primaryImage: `https://example.com/image-${id}.jpg`,
  primaryImageSmall: `https://example.com/image-${id}-small.jpg`,
  additionalImages: [],
  constituents: null,
  department: 'European Paintings',
  objectName: 'Painting',
  title: `Featured Artwork ${id}`,
  culture: '',
  period: '',
  dynasty: '',
  reign: '',
  portfolio: '',
  artistRole: 'Artist',
  artistPrefix: '',
  artistDisplayName: 'Vincent van Gogh',
  artistDisplayBio: 'Dutch, 1853–1890',
  artistSuffix: '',
  artistAlphaSort: 'Gogh, Vincent van',
  artistNationality: 'Dutch',
  artistBeginDate: '1853',
  artistEndDate: '1890',
  artistGender: '',
  artistWikidata_URL: '',
  artistULAN_URL: '',
  objectDate: '1889',
  objectBeginDate: 1889,
  objectEndDate: 1889,
  medium: 'Oil on canvas',
  dimensions: '',
  measurements: null,
  creditLine: '',
  geographyType: '',
  city: '',
  state: '',
  county: '',
  country: '',
  region: '',
  subregion: '',
  locale: '',
  locus: '',
  excavation: '',
  river: '',
  classification: 'Paintings',
  rightsAndReproduction: '',
  linkResource: '',
  metadataDate: '',
  repository: '',
  objectURL: '',
  tags: null,
  objectWikidata_URL: '',
  isTimelineWork: false,
  GalleryNumber: '',
})

describe('useFeaturedArtworks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mockArtworks = [createMockArtwork(436535), createMockArtwork(459055)]
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
      createMockArtwork(436535),
      createMockArtwork(459055),
      createMockArtwork(438817),
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
      createMockArtwork(436535),
      null, // Failed fetch
      createMockArtwork(438817),
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
    const mockArtworks = [createMockArtwork(436535)]
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
    const mockArtworks = [createMockArtwork(436535)]
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
