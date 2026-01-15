import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSimilarArtworks } from '@/lib/hooks/useSimilarArtworks'
import { findSimilarArtworks } from '@/lib/api/artworks'
import type { ArtworkObject } from '@/lib/types/artwork'

jest.mock('@/lib/api/artworks', () => ({
  findSimilarArtworks: jest.fn(),
}))

const mockFindSimilarArtworks = findSimilarArtworks as jest.MockedFunction<typeof findSimilarArtworks>

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

const createMockArtwork = (id: number, title: string, artist: string = 'Vincent van Gogh'): ArtworkObject => ({
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
  title,
  culture: 'Dutch',
  period: '',
  dynasty: '',
  reign: '',
  portfolio: '',
  artistRole: 'Artist',
  artistPrefix: '',
  artistDisplayName: artist,
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

describe('useSimilarArtworks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mockArtwork = createMockArtwork(1, 'Test Artwork')
    const mockSimilarArtworks = [createMockArtwork(2, 'Similar 1'), createMockArtwork(3, 'Similar 2')]
    mockFindSimilarArtworks.mockResolvedValue(mockSimilarArtworks)

    const { result } = renderHook(
      () => useSimilarArtworks(mockArtwork),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch and return similar artworks on success', async () => {
    const mockArtwork = createMockArtwork(1, 'Test Artwork')
    const mockSimilarArtworks = [
      createMockArtwork(2, 'Similar 1'),
      createMockArtwork(3, 'Similar 2'),
      createMockArtwork(4, 'Similar 3'),
    ]
    mockFindSimilarArtworks.mockResolvedValue(mockSimilarArtworks)

    const { result } = renderHook(
      () => useSimilarArtworks(mockArtwork),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockFindSimilarArtworks).toHaveBeenCalledWith(mockArtwork)
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].objectID).toBe(2)
  })

  it('should not fetch when artwork is null', () => {
    const { result } = renderHook(
      () => useSimilarArtworks(null),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(mockFindSimilarArtworks).not.toHaveBeenCalled()
  })

  it('should not fetch when artwork is undefined', () => {
    const { result } = renderHook(
      () => useSimilarArtworks(undefined),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(mockFindSimilarArtworks).not.toHaveBeenCalled()
  })

  it('should handle empty results', async () => {
    const mockArtwork = createMockArtwork(1, 'Test Artwork')
    mockFindSimilarArtworks.mockResolvedValue([])

    const { result } = renderHook(
      () => useSimilarArtworks(mockArtwork),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })


  it('should refetch when artwork changes', async () => {
    const mockArtwork1 = createMockArtwork(1, 'Artwork 1')
    const mockArtwork2 = createMockArtwork(2, 'Artwork 2')
    const mockSimilar1 = [createMockArtwork(3, 'Similar to 1')]
    const mockSimilar2 = [createMockArtwork(4, 'Similar to 2')]

    mockFindSimilarArtworks
      .mockResolvedValueOnce(mockSimilar1)
      .mockResolvedValueOnce(mockSimilar2)

    const { result, rerender } = renderHook(
      ({ artwork }) => useSimilarArtworks(artwork),
      {
        wrapper: createWrapper(),
        initialProps: { artwork: mockArtwork1 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].objectID).toBe(3)

    rerender({ artwork: mockArtwork2 })

    await waitFor(() => {
      expect(mockFindSimilarArtworks).toHaveBeenCalledTimes(2)
      expect(result.current.data?.[0].objectID).toBe(4)
    })
  })

  it('should use correct query key based on artwork ID', async () => {
    const mockArtwork = createMockArtwork(1, 'Test Artwork')
    const mockSimilarArtworks = [createMockArtwork(2, 'Similar 1')]
    mockFindSimilarArtworks.mockResolvedValue(mockSimilarArtworks)

    const { result } = renderHook(
      () => useSimilarArtworks(mockArtwork),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
  })
})
