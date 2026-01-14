import type { Meta, StoryObj } from '@storybook/nextjs'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: Story) => (
      <div className="p-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">Theme:</span>
      <ThemeToggle />
    </div>
  ),
}

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Settings</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  ),
}
