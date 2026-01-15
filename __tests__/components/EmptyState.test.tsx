import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '@/components/features/emptyState'

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No Results"
        description="Try adjusting your search"
      />
    )

    expect(screen.getByText('No Results')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const handleAction = jest.fn()

    render(
      <EmptyState
        title="Empty"
        description="Description"
        action={{
          label: 'Take Action',
          onClick: handleAction,
        }}
      />
    )

    expect(screen.getByText('Take Action')).toBeInTheDocument()
  })

  it('should call action onClick when button is clicked', async () => {
    const handleAction = jest.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        title="Empty"
        description="Description"
        action={{
          label: 'Click Me',
          onClick: handleAction,
        }}
      />
    )

    await user.click(screen.getByText('Click Me'))

    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="Description"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should render different types with correct icons', () => {
    const { rerender } = render(
      <EmptyState type="search" title="Search" description="Desc" />
    )
    expect(screen.getByText('Search')).toBeInTheDocument()

    rerender(<EmptyState type="collection" title="Collection" description="Desc" />)
    expect(screen.getByText('Collection')).toBeInTheDocument()

    rerender(<EmptyState type="error" title="Error" description="Desc" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})
