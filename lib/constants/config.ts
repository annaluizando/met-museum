export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_MET_API_BASE_URL || 
  'https://collectionapi.metmuseum.org/public/collection/v1'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_PER_SECOND: 80,
} as const

export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  PREFETCH_THRESHOLD: 0.8,
} as const

export const REACT_QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  CACHE_TIME: 10 * 60 * 1000,
  REFETCH_ON_WINDOW_FOCUS: false,
  RETRY: 2,
} as const

export const UI_CONFIG = {
  SKELETON_COUNT: 12,
  DEBOUNCE_DELAY: 600,
  IMAGE_FALLBACK: '/placeholder-artwork.jpg',
  SEARCH_HISTORY_LIMIT: 10,
  VIRTUALIZATION_THRESHOLD: 100,
  VIRTUALIZED_LIST_HEIGHT: 600,
  VIRTUALIZED_GRID_HEIGHT: 800,
  SCROLL_TO_TOP_THRESHOLD: 300,
  HISTORY_SAVE_DELAY: 2000,
  TOAST_DEFAULT_DURATION: 3000,
  TOAST_FADE_OUT_DELAY: 200,
  TOAST_CLOSE_DELAY: 300,
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Unable to connect. Please check your internet connection and try again.',
  TIMEOUT: 'The request took too long. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  BAD_REQUEST: 'Invalid request. Please check your input and try again.',
  VALIDATION: 'Invalid input provided. Please check your data and try again.',
} as const
