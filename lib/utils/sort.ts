import type { ArtworkObject } from '@/lib/types/artwork'
import type { SortOrder } from '@/lib/stores/search-store'

const hasImage = (artwork: ArtworkObject): boolean => {
  return !!(artwork.primaryImage || artwork.primaryImageSmall)
}

export function sortArtworks(artworks: ArtworkObject[], sortOrder: SortOrder): ArtworkObject[] {
  if (sortOrder === 'relevance') {
    return artworks
  }

  const sorted = [...artworks]

  switch (sortOrder) {
    case 'date-newest':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aDate = a.objectBeginDate ?? a.objectEndDate ?? 0
        const bDate = b.objectBeginDate ?? b.objectEndDate ?? 0
        return bDate - aDate
      })

    case 'date-oldest':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aDate = a.objectBeginDate ?? a.objectEndDate ?? 0
        const bDate = b.objectBeginDate ?? b.objectEndDate ?? 0
        return aDate - bDate
      })

    case 'title-asc':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aTitle = (a.title || '').toLowerCase()
        const bTitle = (b.title || '').toLowerCase()
        return aTitle.localeCompare(bTitle)
      })

    case 'title-desc':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aTitle = (a.title || '').toLowerCase()
        const bTitle = (b.title || '').toLowerCase()
        return bTitle.localeCompare(aTitle)
      })

    case 'artist-asc':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aArtist = (a.artistDisplayName || a.artistAlphaSort || '').toLowerCase()
        const bArtist = (b.artistDisplayName || b.artistAlphaSort || '').toLowerCase()
        return aArtist.localeCompare(bArtist)
      })

    case 'artist-desc':
      return sorted.sort((a, b) => {
        const aHasImage = hasImage(a)
        const bHasImage = hasImage(b)
        
        if (aHasImage !== bHasImage) {
          return aHasImage ? -1 : 1
        }
        
        const aArtist = (a.artistDisplayName || a.artistAlphaSort || '').toLowerCase()
        const bArtist = (b.artistDisplayName || b.artistAlphaSort || '').toLowerCase()
        return bArtist.localeCompare(aArtist)
      })

    default:
      return sorted
  }
}

