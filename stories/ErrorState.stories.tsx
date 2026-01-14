import type { Meta, StoryObj } from '@storybook/nextjs'
import { ErrorState } from '@/components/features/error-state'
import { fn } from '@storybook/test'

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
  },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: 'Failed to load artworks. Please try again.',
    onRetry: fn(),
  },
}

export const CustomTitle: Story = {
  args: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    onRetry: fn(),
  },
}

export const WithoutRetry: Story = {
  args: {
    title: 'Not Found',
    message: 'The artwork you\'re looking for doesn\'t exist or has been removed.',
  },
}

export const APIError: Story = {
  args: {
    title: 'API Error',
    message: 'The Metropolitan Museum API is currently unavailable. Please try again in a few moments.',
    onRetry: fn(),
  },
}

export const LongMessage: Story = {
  args: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred while processing your request. This might be due to a temporary issue with our servers or your internet connection. Please wait a moment and try again. If the problem persists, please contact support.',
    onRetry: fn(),
  },
}
