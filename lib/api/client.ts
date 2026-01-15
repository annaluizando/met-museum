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

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

const isClient = typeof window !== 'undefined'

function getApiUrl(endpoint: string): string {
  if (!isClient) {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }

  if (endpoint.startsWith('/objects/')) {
    return `/api${endpoint}`
  }
  if (endpoint.startsWith('/search')) {
    return `/api${endpoint}`
  }
  if (endpoint.startsWith('/departments')) {
    return `/api${endpoint}`
  }

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
        let message: string = ERROR_MESSAGES.GENERIC
        if (response.status === 404) {
          message = ERROR_MESSAGES.NOT_FOUND
        } else if (response.status === 500 || response.status >= 500) {
          message = ERROR_MESSAGES.SERVER_ERROR
        } else if (response.status === 400) {
          message = ERROR_MESSAGES.BAD_REQUEST
        } else if (response.status === 401) {
          message = ERROR_MESSAGES.UNAUTHORIZED
        } else if (response.status === 403) {
          message = ERROR_MESSAGES.FORBIDDEN
        }
        
        throw new MetApiError(message, response.status)
      }

      let data: T
      try {
        data = await response.json()
      } catch {
        throw new MetApiError(
          ERROR_MESSAGES.BAD_REQUEST,
          response.status
        )
      }
      
      return data
    } catch (error) {
      lastError = error as Error

      if (error instanceof MetApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt < API_CONFIG.RETRY_ATTEMPTS - 1) {
        await delay(API_CONFIG.RETRY_DELAY * (attempt + 1))
        continue
      }
    }
  }

  clearTimeout(timeoutId)

  if (lastError instanceof MetApiError) {
    throw lastError
  }

  const isTimeout = lastError?.name === 'AbortError'
  const isNetwork = lastError instanceof TypeError && lastError.message.includes('fetch')
  
  let message: string = ERROR_MESSAGES.GENERIC
  if (isTimeout) {
    message = ERROR_MESSAGES.TIMEOUT
  } else if (isNetwork) {
    message = ERROR_MESSAGES.NETWORK
  }

  throw new MetApiError(message, undefined, lastError)
}
