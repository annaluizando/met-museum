import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArtworkDetailView } from './artworkDetailView'
import { getArtworkById } from '@/lib/api/artworks'
import { artworkIdSchema } from '@/lib/validations/artwork'

interface ArtworkPageProps {
  params: Promise<{ id: string }>
}

/**
 * Generate metadata for artwork detail page (SEO)
 */
export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    
    const idResult = artworkIdSchema.safeParse(id)
    if (!idResult.success) {
      return {
        title: 'Artwork Not Found | MetMuseum Explorer',
        description: 'The requested artwork could not be found.',
      }
    }
    
    const artwork = await getArtworkById(idResult.data)
    
    return {
      title: `${artwork.title} | MetMuseum Explorer`,
      description: `${artwork.title} by ${artwork.artistDisplayName || 'Unknown Artist'}. ${artwork.objectDate}. View details from The Metropolitan Museum of Art collection.`,
      openGraph: {
        title: artwork.title,
        description: `${artwork.artistDisplayName || 'Unknown Artist'} - ${artwork.objectDate}`,
        images: artwork.primaryImage ? [artwork.primaryImage] : [],
      },
    }
  } catch (error) {
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      return {
        title: 'Artwork Not Found | MetMuseum Explorer',
        description: 'The requested artwork could not be found.',
      }
    }
    
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
  
  const idResult = artworkIdSchema.safeParse(id)
  if (!idResult.success) {
    notFound()
  }
  
  try {
    await getArtworkById(idResult.data)
  } catch (error) {
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      notFound()
    }
  }
  
  return <ArtworkDetailView artworkId={idResult.data} />
}
