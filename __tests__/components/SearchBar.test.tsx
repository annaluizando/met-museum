import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/features/searchBar'
import { useSearchStore } from '@/lib/stores/search-store'

// Mock the search store
jest.mock('@/lib/stores/search-store')

describe('SearchBar', () => {
  const mockSetQuery = jest.fn()
  const mockSetViewMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: '',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    })
  })

  it('should render search input', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/search artworks/i)).toBeInTheDocument()
  })

  it('should update query on input change', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search artworks/i)
    await user.type(input, 'van gogh')

    // Wait for debounce
    await waitFor(() => {
      expect(mockSetQuery).toHaveBeenCalledWith('van gogh')
    }, { timeout: 500 })
  })

  it('should show clear button when there is text', async () => {
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: 'test',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    })

    render(<SearchBar />)
    
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
  })

  it('should clear query when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: 'test',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    })

    render(<SearchBar />)

    await user.click(screen.getByLabelText(/clear search/i))

    expect(mockSetQuery).toHaveBeenCalledWith('')
  })

  it('should toggle view mode when button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const viewModeButton = screen.getByLabelText(/switch to list view/i)
    await user.click(viewModeButton)

    expect(mockSetViewMode).toHaveBeenCalledWith('list')
  })

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search artworks/i)
    
    await user.tab()
    expect(input).toHaveFocus()

    await user.keyboard('monet')

    await waitFor(() => {
      expect(mockSetQuery).toHaveBeenCalledWith('monet')
    }, { timeout: 500 })
  })
})
