/**
 * Centralized React Query keys for consistent caching
 */
export const QUERY_KEYS = {
  ARTWORKS: {
    ALL: ['artworks'] as const,
    SEARCH: (query: string, filters?: Record<string, unknown>) => 
      ['artworks', 'search', query, filters] as const,
    DETAIL: (id: number) => ['artworks', 'detail', id] as const,
    INFINITE: (query: string, filters?: Record<string, unknown>) =>
      ['artworks', 'infinite', query, filters] as const,
    COLLECTION: (collectionId: string) => ['artworks', 'collection', collectionId] as const,
    FEATURED: ['artworks', 'featured'] as const,
  },
  DEPARTMENTS: {
    ALL: ['departments'] as const,
  },
  COLLECTIONS: {
    ALL: ['collections'] as const,
    DETAIL: (id: string) => ['collections', 'detail', id] as const,
  },
} as const
