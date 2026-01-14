import { API_CONFIG } from '@/lib/constants/config'
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
 * Generic fetch wrapper with error handling, timeout, and retry logic
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  let lastError: Error | null = null

  for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new MetApiError(
          `API request failed: ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()
      return data as T
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

  // If all retries failed, throw the last error
  throw new MetApiError(
    lastError?.message || 'Request failed. Please try again later.',
    undefined,
    lastError
  )
}
