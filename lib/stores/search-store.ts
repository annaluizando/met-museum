import { create } from 'zustand'
import type { SearchFilters } from '@/lib/types/artwork'

interface SearchState {
  query: string
  filters: SearchFilters
  viewMode: 'grid' | 'list'
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  setViewMode: (mode: 'grid' | 'list') => void
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
  
  setQuery: (query) => set({ query }),
  
  setFilters: (filters) => set({ filters }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}))
