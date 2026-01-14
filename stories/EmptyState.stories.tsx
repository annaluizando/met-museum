import type { Meta, StoryObj } from '@storybook/nextjs'
import { EmptyState } from '@/components/features/empty-state'
import { fn } from '@storybook/test'

const meta = {
  title: 'Features/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['search', 'collection', 'error'],
      description: 'The type of empty state to display',
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Search: Story = {
  args: {
    type: 'search',
    title: 'No artworks found',
    description: 'We couldn\'t find any artworks matching your search. Try adjusting your search terms or filters.',
  },
}

export const Collection: Story = {
  args: {
    type: 'collection',
    title: 'No collections yet',
    description: 'Start building your personal art collection by creating your first collection.',
    action: {
      label: 'Create Collection',
      onClick: fn(),
    },
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Something went wrong',
    description: 'We encountered an error while loading the data. Please try again later.',
    action: {
      label: 'Retry',
      onClick: fn(),
    },
  },
}

export const WithAction: Story = {
  args: {
    type: 'search',
    title: 'Start your exploration',
    description: 'Search for artworks, artists, cultures, or time periods from The Metropolitan Museum of Art\'s collection.',
    action: {
      label: 'Browse All Artworks',
      onClick: fn(),
    },
  },
}

export const WithoutAction: Story = {
  args: {
    type: 'search',
    title: 'No results',
    description: 'Your search didn\'t return any results. Try using different keywords.',
  },
}
