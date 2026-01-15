import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useArtworkDetail } from '@/lib/hooks/useArtworkDetail'
import { getArtworkById } from '@/lib/api/artworks'
import type { ArtworkObject } from '@/lib/types/artwork'
import React from 'react'

// Mock the API function
jest.mock('@/lib/api/artworks', () => ({
  getArtworkById: jest.fn(),
}))

const mockGetArtworkById = getArtworkById as jest.MockedFunction<typeof getArtworkById>

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
  title: 'Test Artwork',
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
