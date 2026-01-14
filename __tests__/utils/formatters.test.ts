import { formatArtworkDate, truncateText, sanitizeImageUrl } from '@/lib/utils/formatters'

describe('formatters', () => {
  describe('formatArtworkDate', () => {
    it('should format a single year', () => {
      expect(formatArtworkDate(1889, 1889)).toBe('1889')
    })

    it('should format a date range', () => {
      expect(formatArtworkDate(1850, 1900)).toBe('1850–1900')
    })

    it('should handle missing end date', () => {
      expect(formatArtworkDate(1889, null)).toBe('1889')
    })

    it('should handle missing dates', () => {
      expect(formatArtworkDate(null, null)).toBe('Date unknown')
    })

    it('should handle only begin date', () => {
      expect(formatArtworkDate(1500, undefined)).toBe('1500')
    })
  })

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 50)).toBe(text)
    })

    it('should truncate text longer than max length', () => {
      const text = 'This is a very long text that needs to be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long...')
      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
    })

    it('should handle exact max length', () => {
      const text = 'Exact'
      expect(truncateText(text, 5)).toBe(text)
    })
  })

  describe('sanitizeImageUrl', () => {
    it('should accept valid https URL', () => {
      const url = 'https://images.metmuseum.org/image.jpg'
      expect(sanitizeImageUrl(url)).toBe(url)
    })

    it('should reject http URL', () => {
      const url = 'http://images.metmuseum.org/image.jpg'
      expect(sanitizeImageUrl(url)).toBeNull()
    })

    it('should reject invalid URL', () => {
      expect(sanitizeImageUrl('not-a-url')).toBeNull()
    })

    it('should handle null input', () => {
      expect(sanitizeImageUrl(null)).toBeNull()
    })

    it('should handle undefined input', () => {
      expect(sanitizeImageUrl(undefined)).toBeNull()
    })
  })
})
