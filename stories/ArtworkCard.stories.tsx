import type { Meta, StoryObj } from '@storybook/nextjs'
import { ArtworkCard } from '@/components/features/artwork-card'
import type { ArtworkObject } from '@/lib/types/artwork'

const meta = {
  title: 'Features/ArtworkCard',
  component: ArtworkCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    viewMode: {
      control: 'radio',
      options: ['grid', 'list'],
      description: 'Display mode for the artwork card',
    },
  },
} satisfies Meta<typeof ArtworkCard>

export default meta
type Story = StoryObj<typeof meta>

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
}

export const WithData: Story = {
  args: {
    artwork: mockArtwork,
    viewMode: 'grid',
  },
}

export const ListView: Story = {
  args: {
    artwork: mockArtwork,
    viewMode: 'list',
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
}

export const NoImage: Story = {
  args: {
    artwork: {
      ...mockArtwork,
      primaryImage: '',
      primaryImageSmall: '',
    },
    viewMode: 'grid',
  },
}

export const NotPublicDomain: Story = {
  args: {
    artwork: {
      ...mockArtwork,
      isPublicDomain: false,
    },
    viewMode: 'grid',
  },
}

export const LongTitle: Story = {
  args: {
    artwork: {
      ...mockArtwork,
      title: 'A Very Long Artwork Title That Should Be Truncated When Displayed in the Card Component to Maintain Visual Consistency',
    },
    viewMode: 'grid',
  },
}

export const UnknownArtist: Story = {
  args: {
    artwork: {
      ...mockArtwork,
      artistDisplayName: '',
    },
    viewMode: 'grid',
  },
}

export const Loading: Story = {
  render: () => {
    const { ArtworkCardSkeleton } = require('@/components/features/artwork-card-skeleton')
    return <ArtworkCardSkeleton viewMode="grid" />
  },
}

export const LoadingList: Story = {
  render: () => {
    const { ArtworkCardSkeleton } = require('@/components/features/artwork-card-skeleton')
    return (
      <div className="max-w-3xl">
        <ArtworkCardSkeleton viewMode="list" />
      </div>
    )
  },
}
