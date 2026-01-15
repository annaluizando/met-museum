import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Search } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button variant
 */
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

/**
 * All button variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/**
 * All button sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  ),
};

/**
 * Button with icon
 */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Heart className="w-4 h-4" />
        Add to Collection
      </>
    ),
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    children: (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </>
    ),
    disabled: true,
  },
};

/**
 * Interactive example - try different variants and sizes
 */
export const Interactive: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Click me',
  },
};
