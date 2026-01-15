import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchBar } from '@/components/features/searchBar'
import { useSearchStore } from '@/lib/stores/search-store'
import { UI_CONFIG } from '@/lib/constants/config'

// Mock Next.js App Router hooks
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPathname = '/'
const createMockSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value)
  })
  return searchParams
}

let mockSearchParams = createMockSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}))

jest.mock('@/lib/stores/search-store')

jest.mock('@/lib/hooks/useDepartments', () => ({
  useDepartments: () => ({
    data: { departments: [] },
    isLoading: false,
    error: null,
  }),
}))

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('SearchBar', () => {
  const mockSetQuery = jest.fn()
  const mockSetViewMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = createMockSearchParams()
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: '',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      filters: {},
    })
  })

  it('should render search input', () => {
    renderWithQueryClient(<SearchBar />)
    expect(screen.getByPlaceholderText(/search by title, artist, or culture/i)).toBeInTheDocument()
  })

  it('should update query on input change', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime })
    
    renderWithQueryClient(<SearchBar />)

    const input = screen.getByPlaceholderText(/search by title, artist, or culture/i)
    await user.type(input, 'van gogh')

    // Initially, setQuery should not be called (debounced)
    expect(mockSetQuery).not.toHaveBeenCalled()

    // Advance timers to trigger debounce
    jest.advanceTimersByTime(UI_CONFIG.DEBOUNCE_DELAY)

    // Now setQuery should be called
    expect(mockSetQuery).toHaveBeenCalledWith('van gogh')
    
    jest.useRealTimers()
  })

  it('should show clear button when there is text', async () => {
    // Set search params to have a query so localQuery initializes with text
    mockSearchParams = createMockSearchParams({ q: 'test' })
    
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: 'test',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      filters: {},
    })

    renderWithQueryClient(<SearchBar />)
    
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
  })

  it('should clear query when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    // Set search params to have a query so localQuery initializes with text
    mockSearchParams = createMockSearchParams({ q: 'test' })
    
    ;(useSearchStore as unknown as jest.Mock).mockReturnValue({
      query: 'test',
      setQuery: mockSetQuery,
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      filters: {},
    })

    renderWithQueryClient(<SearchBar />)

    await user.click(screen.getByLabelText(/clear search/i))

    expect(mockSetQuery).toHaveBeenCalledWith('')
  })

  it('should toggle view mode when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<SearchBar />)

    const viewModeButton = screen.getByLabelText(/switch to list view/i)
    await user.click(viewModeButton)

    expect(mockSetViewMode).toHaveBeenCalledWith('list')
  })

  it('should be keyboard accessible', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime })
    
    renderWithQueryClient(<SearchBar />)

    const input = screen.getByPlaceholderText(/search by title, artist, or culture/i)
    
    await user.tab()
    expect(input).toHaveFocus()

    await user.type(input, 'monet')

    // Initially, setQuery should not be called (debounced)
    expect(mockSetQuery).not.toHaveBeenCalled()

    // Advance timers to trigger debounce
    jest.advanceTimersByTime(UI_CONFIG.DEBOUNCE_DELAY)

    // Now setQuery should be called
    expect(mockSetQuery).toHaveBeenCalledWith('monet')
    
    jest.useRealTimers()
  })
})
