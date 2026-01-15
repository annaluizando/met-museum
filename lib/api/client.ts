import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'
import type { ApiError } from '@/lib/types/artwork'

/**
 * Custom API Error class
 */
export class MetApiError extends Error implements ApiError {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'MetApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Delay helper for retry logic
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Check if code is running on the client side
 */
const isClient = typeof window !== 'undefined'

/**
 * Map API endpoints to Next.js Route Handler proxies for client-side requests
 * 
 * Strategy:
 * - Client Components: Route through /api/* proxies to avoid CORS
 * - Server Components: Use direct API calls (faster, no proxy overhead)
 * 
 * @see https://nextjs.org/docs/app/guides/backend-for-frontend
 */
function getApiUrl(endpoint: string): string {
  // Server-side
  if (!isClient) {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }

  // Client-side: route through Next.js Route Handlers to avoid CORS
  if (endpoint.startsWith('/objects/')) {
    return `/api${endpoint}`
  }
  if (endpoint.startsWith('/search')) {
    return `/api${endpoint}`
  }
  if (endpoint.startsWith('/departments')) {
    return `/api${endpoint}`
  }

  // Fallback
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * Generic fetch wrapper with error handling, timeout, and retry logic
 * 
 * Automatically routes client-side requests through Next.js Route Handlers
 * to prevent CORS issues, while server-side requests use direct API calls.
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(endpoint)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  let lastError: Error | null = null

  for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const headers: Record<string, string> = {}
      
      if (options?.body) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...headers,
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new MetApiError(
          ERROR_MESSAGES.GENERIC,
          response.status
        )
      }

      let data: T
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new MetApiError(
          ERROR_MESSAGES.GENERIC,
          response.status
        )
      }
      
      return data
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors
      if (error instanceof MetApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error
      }

      // If not the last attempt, wait and retry
      if (attempt < API_CONFIG.RETRY_ATTEMPTS - 1) {
        await delay(API_CONFIG.RETRY_DELAY * (attempt + 1))
        continue
      }
    }
  }

  clearTimeout(timeoutId)

  throw new MetApiError(
    ERROR_MESSAGES.GENERIC,
    undefined,
    lastError // Keep details for server-side logging only
  )
}
