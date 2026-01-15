import { MetApiError } from '@/lib/api/client'
import { ERROR_MESSAGES } from '@/lib/constants/config'

export interface ErrorInfo {
  message: string
  title: string
  isRetryable: boolean
}

const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }
  return false
}

const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }
  return false
}

export function getErrorMessage(error: unknown): ErrorInfo {
  if (error instanceof MetApiError) {
    const status = error.status

    if (status === 404) {
      return {
        message: ERROR_MESSAGES.NOT_FOUND,
        title: 'Not Found',
        isRetryable: false,
      }
    }

    if (status === 401) {
      return {
        message: ERROR_MESSAGES.UNAUTHORIZED,
        title: 'Unauthorized',
        isRetryable: false,
      }
    }

    if (status === 403) {
      return {
        message: ERROR_MESSAGES.FORBIDDEN,
        title: 'Forbidden',
        isRetryable: false,
      }
    }

    if (status === 400) {
      return {
        message: ERROR_MESSAGES.BAD_REQUEST,
        title: 'Invalid Request',
        isRetryable: false,
      }
    }

    if (status && status >= 500) {
      return {
        message: ERROR_MESSAGES.SERVER_ERROR,
        title: 'Server Error',
        isRetryable: true,
      }
    }
  }

  if (isNetworkError(error)) {
    return {
      message: ERROR_MESSAGES.NETWORK,
      title: 'Connection Error',
      isRetryable: true,
    }
  }

  if (isTimeoutError(error)) {
    return {
      message: ERROR_MESSAGES.TIMEOUT,
      title: 'Request Timeout',
      isRetryable: true,
    }
  }

  return {
    message: ERROR_MESSAGES.GENERIC,
    title: 'Something went wrong',
    isRetryable: true,
  }
}
