export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_MET_API_BASE_URL || 
  'https://collectionapi.metmuseum.org/public/collection/v1'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT_PER_SECOND: 80,
} as const

// Pagination Configuration
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  PREFETCH_THRESHOLD: 0.8, // Prefetch when 80% scrolled
} as const

// React Query Configuration
export const REACT_QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  REFETCH_ON_WINDOW_FOCUS: false,
  RETRY: 2,
} as const

// UI Configuration
export const UI_CONFIG = {
  SKELETON_COUNT: 12,
  DEBOUNCE_DELAY: 600,
  IMAGE_FALLBACK: '/placeholder-artwork.jpg',
  SEARCH_HISTORY_LIMIT: 10, // Maximum number of search history items to store
  VIRTUALIZATION_THRESHOLD: 100, // Enable virtualization when items >= this count
  VIRTUALIZED_LIST_HEIGHT: 600, // Height for virtualized list view (px)
  VIRTUALIZED_GRID_HEIGHT: 800, // Height for virtualized grid view (px)
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
} as const
