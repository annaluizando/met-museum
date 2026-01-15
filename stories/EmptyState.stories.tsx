import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyState } from '@/components/features/empty-state';

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
    title: {
      control: 'text',
      description: 'The title text',
    },
    description: {
      control: 'text',
      description: 'The description text',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state for search results when no artworks are found
 */
export const SearchEmpty: Story = {
  args: {
    type: 'search',
    title: 'No artworks found',
    description: "We couldn't find any artworks matching your search. Try adjusting your search terms or filters.",
  },
};

/**
 * Empty state for empty collections
 */
export const CollectionEmpty: Story = {
  args: {
    type: 'collection',
    title: 'No artworks in collection',
    description: 'Start building your collection by adding artworks you love. Browse the gallery and click the heart icon to add pieces.',
    action: {
      label: 'Browse Artworks',
      onClick: () => console.log('Browse clicked'),
    },
  },
};

/**
 * Empty state with action button
 */
export const WithAction: Story = {
  args: {
    type: 'search',
    title: 'No results found',
    description: "We couldn't find any artworks matching your search. Try a different search term or browse our featured collection.",
    action: {
      label: 'View Featured Artworks',
      onClick: () => console.log('View featured clicked'),
    },
  },
};

/**
 * Empty state without action button
 */
export const WithoutAction: Story = {
  args: {
    type: 'search',
    title: 'No results',
    description: "We couldn't find any artworks matching your search criteria.",
  },
};

/**
 * Error type empty state
 */
export const ErrorType: Story = {
  args: {
    type: 'error',
    title: 'Something went wrong',
    description: 'We encountered an issue while loading your content. Please try again later.',
  },
};
