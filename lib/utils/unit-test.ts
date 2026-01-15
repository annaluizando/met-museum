import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ArtworkObject } from '@/lib/types/artwork'

/**
 * Creates a QueryClient configured for testing
 * - retry: false - prevents retries in tests
 * - gcTime: 0 - immediately garbage collects queries
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

/**
 * Creates a wrapper component for React Query hooks in tests
 */
export const createWrapper = () => {
  const queryClient = createTestQueryClient()
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

/**
 * Creates a mock ArtworkObject for testing
 * @param id - The artwork object ID
 * @param overrides - Optional properties to override defaults
 */
export const createMockArtwork = (
  id: number,
  overrides?: Partial<ArtworkObject>
): ArtworkObject => ({
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
  title: overrides?.title ?? 'Test Artwork',
  culture: overrides?.culture ?? 'Dutch',
  period: '',
  dynasty: '',
  reign: '',
  portfolio: '',
  artistRole: 'Artist',
  artistPrefix: '',
  artistDisplayName: overrides?.artistDisplayName ?? 'Vincent van Gogh',
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
  ...overrides,
})
