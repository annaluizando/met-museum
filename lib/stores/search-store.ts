import { create } from 'zustand'
import type { SearchFilters } from '@/lib/types/artwork'

export type SortOrder = 
  | 'relevance'
  | 'date-newest'
  | 'date-oldest'
  | 'title-asc'
  | 'title-desc'
  | 'artist-asc'
  | 'artist-desc'

interface SearchState {
  query: string
  filters: SearchFilters
  viewMode: 'grid' | 'list'
  sortOrder: SortOrder
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortOrder: (order: SortOrder) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: SearchFilters = {}

/**
 * Zustand store for managing search state across the application
 */
export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  filters: DEFAULT_FILTERS,
  viewMode: 'grid',
  sortOrder: 'relevance',
  
  setQuery: (query) => set({ query }),
  
  setFilters: (filters) => set({ filters }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}))
