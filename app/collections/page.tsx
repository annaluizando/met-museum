import type { Metadata } from 'next'
import { CollectionList } from '@/components/features/collectionList'

export const metadata: Metadata = {
  title: 'My Collections | MetMuseum Explorer',
  description: 'Manage your personal art collections from The Metropolitan Museum of Art',
}

/**
 * Collections page with CRUD functionality
 */
export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CollectionList />
    </div>
  )
}
