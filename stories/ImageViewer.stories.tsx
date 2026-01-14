import type { Meta, StoryObj } from '@storybook/react'
import { ImageViewer } from '@/components/features/image-viewer'

const meta = {
  title: 'Features/ImageViewer',
  component: ImageViewer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl aspect-square">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    src: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
    alt: 'Wheat Field with Cypresses by Vincent van Gogh',
    title: 'Wheat Field with Cypresses by Vincent van Gogh, 1889',
  },
}

export const WithoutTitle: Story = {
  args: {
    src: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
    alt: 'Artwork without title',
  },
}

export const Portrait: Story = {
  args: {
    src: 'https://images.metmuseum.org/CRDImages/ep/original/DP-14936-023.jpg',
    alt: 'Portrait artwork',
    title: 'Portrait Artwork Example',
  },
}
