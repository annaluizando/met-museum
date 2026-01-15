import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ErrorState } from '@/components/features/error-state';

const meta = {
  title: 'Features/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The error title',
    },
    message: {
      control: 'text',
      description: 'The error message',
    },
    onRetry: {
      action: 'retry',
      description: 'Callback function when retry button is clicked',
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default error state with retry functionality
 */
export const Default: Story = {
  args: {
    title: 'Something went wrong',
    message: 'Failed to load artworks. Please try again.',
    onRetry: () => console.log('Retry clicked'),
  },
};

/**
 * Error state with custom title
 */
export const CustomTitle: Story = {
  args: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    onRetry: () => console.log('Retry clicked'),
  },
};

/**
 * Error state without retry button
 */
export const WithoutRetry: Story = {
  args: {
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
  },
};

/**
 * Network error state
 */
export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message: 'Failed to fetch data from the server. Please check your connection and try again.',
    onRetry: () => console.log('Retry clicked'),
  },
};
