export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
}

export function sanitizeNumber(
  input: string | number | undefined | null,
  min?: number,
  max?: number
): number | null {
  if (input === undefined || input === null || input === '') {
    return null
  }

  const num = typeof input === 'string' ? Number(input) : input

  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  const intNum = Math.floor(num)

  if (min !== undefined && intNum < min) {
    return null
  }

  if (max !== undefined && intNum > max) {
    return null
  }

  return intNum
}

/**
 * Sanitizes a boolean input
 * 
 * @param input - Raw input
 * @returns Sanitized boolean or null
 */
export function sanitizeBoolean(
  input: string | boolean | undefined | null
): boolean | null {
  if (typeof input === 'boolean') {
    return input
  }

  if (input === undefined || input === null || input === '') {
    return null
  }

  const str = String(input).toLowerCase().trim()
  return str === 'true' || str === '1'
}

export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return input.replace(/[&<>"']/g, (m) => map[m])
}

export function sanitizeSearchQuery(query: string): string {
  const sanitized = sanitizeString(query)
  
  if (sanitized.length > 500) {
    return sanitized.substring(0, 500)
  }

  return sanitized
}
