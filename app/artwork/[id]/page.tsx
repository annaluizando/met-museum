import type { Metadata } from 'next'
import { ArtworkDetailView } from './artwork-detail-view'
import { getArtworkById } from '@/lib/api/artworks'

interface ArtworkPageProps {
  params: Promise<{ id: string }>
}

/**
 * Generate metadata for artwork detail page (SEO)
 */
export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const artwork = await getArtworkById(parseInt(id))
    
    return {
      title: `${artwork.title} | MetMuseum Explorer`,
      description: `${artwork.title} by ${artwork.artistDisplayName || 'Unknown Artist'}. ${artwork.objectDate}. View details from The Metropolitan Museum of Art collection.`,
      openGraph: {
        title: artwork.title,
        description: `${artwork.artistDisplayName || 'Unknown Artist'} - ${artwork.objectDate}`,
        images: artwork.primaryImage ? [artwork.primaryImage] : [],
      },
    }
  } catch {
    return {
      title: 'Artwork Details | MetMuseum Explorer',
      description: 'View artwork details from The Metropolitan Museum of Art collection',
    }
  }
}

/**
 * Artwork detail page with full metadata
 */
export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { id } = await params
  
  return <ArtworkDetailView artworkId={parseInt(id)} />
}
