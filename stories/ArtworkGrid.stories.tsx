import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArtworkGrid } from '@/components/features/artworkGrid';
import { ArtworkCardSkeleton } from '@/components/features/artworkCardSkeleton';
import { EmptyState } from '@/components/features/emptyState';
import { ErrorState } from '@/components/features/errorState';
import { ArtworkCard } from '@/components/features/artworkCard';
import type { ArtworkObject } from '@/lib/types/artwork';

const meta = {
  title: 'Features/ArtworkGrid',
  component: ArtworkGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArtworkGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockArtwork: ArtworkObject = {
  objectID: 437133,
  isHighlight: true,
  accessionNumber: '1993.132',
  accessionYear: '1993',
  isPublicDomain: true,
  primaryImage: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  additionalImages: [],
  constituents: null,
  department: 'European Paintings',
  objectName: 'Painting',
  title: 'Wheat Field with Cypresses',
  culture: '',
  period: '',
  dynasty: '',
  reign: '',
  portfolio: '',
  artistRole: 'Artist',
  artistPrefix: '',
  artistDisplayName: 'Vincent van Gogh',
  artistDisplayBio: 'Dutch, 1853–1890',
  artistSuffix: '',
  artistAlphaSort: 'Gogh, Vincent van',
  artistNationality: 'Dutch',
  artistBeginDate: '1853',
  artistEndDate: '1890',
  artistGender: '',
  artistWikidata_URL: 'https://www.wikidata.org/wiki/Q5582',
  artistULAN_URL: 'http://vocab.getty.edu/page/ulan/500115588',
  objectDate: '1889',
  objectBeginDate: 1889,
  objectEndDate: 1889,
  medium: 'Oil on canvas',
  dimensions: '28 7/8 x 36 3/4 in. (73.2 x 93.4 cm)',
  measurements: null,
  creditLine: 'Purchase, The Annenberg Foundation Gift, 1993',
  geographyType: '',
  city: '',
  state: '',
  county: '',
  country: '',
  region: '',
  subregion: '',
  locale: '',
  locus: '',
  excavation: '',
  river: '',
  classification: 'Paintings',
  rightsAndReproduction: '',
  linkResource: '',
  metadataDate: '2021-09-23T04:36:08.027Z',
  repository: 'Metropolitan Museum of Art, New York, NY',
  objectURL: 'https://www.metmuseum.org/art/collection/search/437133',
  tags: null,
  objectWikidata_URL: 'https://www.wikidata.org/wiki/Q29910832',
  isTimelineWork: false,
  GalleryNumber: '',
};

const mockArtworks: ArtworkObject[] = [
  mockArtwork,
  {
    ...mockArtwork,
    objectID: 436524,
    title: 'The Starry Night',
    artistDisplayName: 'Vincent van Gogh',
    primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  },
  {
    ...mockArtwork,
    objectID: 437134,
    title: 'Sunflowers',
    artistDisplayName: 'Vincent van Gogh',
    primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  },
  {
    ...mockArtwork,
    objectID: 437135,
    title: 'Irises',
    artistDisplayName: 'Vincent van Gogh',
    primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  },
];

/**
 * Loading state - shows skeleton cards while data is being fetched
 */
export const Loading: Story = {
  render: () => (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ArtworkCardSkeleton key={index} viewMode="grid" />
        ))}
      </div>
    </div>
  ),
};

/**
 * Empty state - shown when no artworks are found
 */
export const Empty: Story = {
  render: () => (
    <div className="p-8">
      <EmptyState
        type="search"
        title="No artworks found"
        description="We couldn't find any artworks matching your search. Try adjusting your search terms or filters."
      />
    </div>
  ),
};

/**
 * Error state - shown when there's an error loading artworks
 */
export const Error: Story = {
  render: () => (
    <div className="p-8">
      <ErrorState
        title="Something went wrong"
        message="Failed to load artworks. Please try again."
        onRetry={() => console.log('Retry clicked')}
      />
    </div>
  ),
};

/**
 * With data - shows artwork cards in grid layout
 */
export const WithData: Story = {
  render: () => (
    <div className="p-8">
      <div className="mb-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold">{mockArtworks.length}</span> artwork{mockArtworks.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockArtworks.map((artwork) => (
          <ArtworkCard key={artwork.objectID} artwork={artwork} viewMode="grid" />
        ))}
      </div>
    </div>
  ),
};

/**
 * With data - list view
 */
export const WithDataListView: Story = {
  render: () => (
    <div className="p-8">
      <div className="mb-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold">{mockArtworks.length}</span> artwork{mockArtworks.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {mockArtworks.map((artwork) => (
          <ArtworkCard key={artwork.objectID} artwork={artwork} viewMode="list" />
        ))}
      </div>
    </div>
  ),
};

/**
 * Loading more - shows additional skeleton cards while loading more items
 */
export const LoadingMore: Story = {
  render: () => (
    <div className="p-8">
      <div className="mb-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold">{mockArtworks.length}</span> artworks (loading more...)
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockArtworks.map((artwork) => (
          <ArtworkCard key={artwork.objectID} artwork={artwork} viewMode="grid" />
        ))}
        {Array.from({ length: 4 }).map((_, index) => (
          <ArtworkCardSkeleton key={`skeleton-${index}`} viewMode="grid" />
        ))}
      </div>
    </div>
  ),
};
