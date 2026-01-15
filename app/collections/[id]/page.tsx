import type { Metadata } from 'next'
import { CollectionDetailView } from './collectionDetailView'

interface CollectionPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Collection | MetMuseum Explorer`,
    description: 'View and manage your art collection',
  }
}

/**
 * Collection detail page
 */
export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params
  return <CollectionDetailView collectionId={id} />
}
