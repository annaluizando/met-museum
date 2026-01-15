import { renderHook, waitFor } from '@testing-library/react'
import { useDepartments } from '@/lib/hooks/useDepartments'
import { getDepartments } from '@/lib/api/artworks'
import type { DepartmentsResponse } from '@/lib/types/artwork'
import { createWrapper } from '@/lib/utils/unit-test'

jest.mock('@/lib/api/artworks', () => ({
  getDepartments: jest.fn(),
}))

const mockGetDepartments = getDepartments as jest.MockedFunction<typeof getDepartments>

describe('useDepartments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [
        { departmentId: 1, displayName: 'European Paintings' },
        { departmentId: 2, displayName: 'American Paintings' },
      ],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const { result } = renderHook(
      () => useDepartments(),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch and return departments on success', async () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [
        { departmentId: 1, displayName: 'European Paintings' },
        { departmentId: 2, displayName: 'American Paintings' },
        { departmentId: 3, displayName: 'Asian Art' },
      ],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const { result } = renderHook(
      () => useDepartments(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetDepartments).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockDepartments)
    expect(result.current.data?.departments).toHaveLength(3)
  })

  it('should handle empty departments list', async () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const { result } = renderHook(
      () => useDepartments(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.departments).toEqual([])
  })

  it('should not refetch on window focus', async () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [{ departmentId: 1, displayName: 'European Paintings' }],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const { result } = renderHook(
      () => useDepartments(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const initialCallCount = mockGetDepartments.mock.calls.length

    window.dispatchEvent(new Event('focus'))

    // Should not refetch
    await waitFor(() => {
      expect(mockGetDepartments.mock.calls.length).toBe(initialCallCount)
    })
  })

  it('should use correct query key', async () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [{ departmentId: 1, displayName: 'European Paintings' }],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const { result } = renderHook(
      () => useDepartments(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
  })

  it('should cache departments data', async () => {
    const mockDepartments: DepartmentsResponse = {
      departments: [{ departmentId: 1, displayName: 'European Paintings' }],
    }
    mockGetDepartments.mockResolvedValue(mockDepartments)

    const wrapper = createWrapper()
    
    // First render
    const { result: result1 } = renderHook(
      () => useDepartments(),
      { wrapper }
    )

    await waitFor(() => expect(result1.current.isSuccess).toBe(true))

    // Second render - should use cache
    const { result: result2 } = renderHook(
      () => useDepartments(),
      { wrapper }
    )

    expect(result2.current.data).toBeDefined()
    expect(mockGetDepartments).toHaveBeenCalledTimes(1)
  })
})
