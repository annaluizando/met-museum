/**
 * Formats a date string or number to a readable year or range
 * @param objectBeginDate - Start date
 * @param objectEndDate - End date
 * @returns Formatted date string
 */
export function formatArtworkDate(
  objectBeginDate?: number | null,
  objectEndDate?: number | null
): string {
  if (!objectBeginDate && !objectEndDate) {
    return "Date unknown"
  }

  if (objectBeginDate === objectEndDate || !objectEndDate) {
    return objectBeginDate ? String(objectBeginDate) : "Date unknown"
  }

  return `${objectBeginDate}–${objectEndDate}`
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

/**
 * Sanitizes and validates image URLs
 * @param url - URL to validate
 * @returns Valid URL or null
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}
