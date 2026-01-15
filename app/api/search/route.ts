import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'
import { searchQuerySchema, searchFiltersSchema } from '@/lib/validations/search'
import { sanitizeSearchQuery, sanitizeString, sanitizeNumber, sanitizeBoolean } from '@/lib/utils/sanitize'

/**
 * Route Handler: Proxy for searching artworks
 * 
 * Purpose: Prevents CORS issues for client-side requests
 * Server Components should use direct API calls (no proxy needed)
 * 
 * @see https://nextjs.org/docs/app/guides/backend-for-frontend
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const rawQuery = searchParams.get('q') || ''
    const sanitizedQuery = sanitizeSearchQuery(rawQuery)
    const queryResult = searchQuerySchema.safeParse(sanitizedQuery)
    
    if (!queryResult.success || !sanitizedQuery) {
      console.error('Search query validation failed:', {
        query: sanitizedQuery,
        errors: queryResult.success ? undefined : queryResult.error.issues,
      })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 400 }
      )
    }

    const filters: Record<string, string | number | boolean> = {}
    
    // Department ID
    const deptId = searchParams.get('departmentId')
    if (deptId) {
      const sanitized = sanitizeNumber(Number(deptId), 1)
      if (sanitized !== null) {
        filters.departmentId = sanitized
      }
    }
    
    // Medium
    const medium = searchParams.get('medium')
    if (medium) {
      const sanitized = sanitizeString(medium).substring(0, 200)
      if (sanitized) {
        filters.medium = sanitized
      }
    }
    
    // Geographic Location
    const geoLocation = searchParams.get('geoLocation')
    if (geoLocation) {
      const sanitized = sanitizeString(geoLocation).substring(0, 200)
      if (sanitized) {
        filters.geoLocation = sanitized
      }
    }
    
    // Date range
    const dateBegin = searchParams.get('dateBegin')
    const dateEnd = searchParams.get('dateEnd')
    if (dateBegin) {
      const sanitized = sanitizeNumber(Number(dateBegin), -5000, new Date().getFullYear())
      if (sanitized !== null) {
        filters.dateBegin = sanitized
      }
    }
    if (dateEnd) {
      const sanitized = sanitizeNumber(Number(dateEnd), -5000, new Date().getFullYear())
      if (sanitized !== null) {
        filters.dateEnd = sanitized
      }
    }
    
    // Boolean filters
    const hasImages = searchParams.get('hasImages')
    if (hasImages !== null) {
      const sanitized = sanitizeBoolean(hasImages)
      if (sanitized !== null) {
        filters.hasImages = sanitized
      }
    }
    
    const isHighlight = searchParams.get('isHighlight')
    if (isHighlight !== null) {
      const sanitized = sanitizeBoolean(isHighlight)
      if (sanitized !== null) {
        filters.isHighlight = sanitized
      }
    }
    
    const isOnView = searchParams.get('isOnView')
    if (isOnView !== null) {
      const sanitized = sanitizeBoolean(isOnView)
      if (sanitized !== null) {
        filters.isOnView = sanitized
      }
    }
    
    // Validate filters with Zod
    const filtersResult = searchFiltersSchema.safeParse(filters)
    const validatedFilters = filtersResult.success ? filtersResult.data : {}
    
    // Build safe URL parameters
    const safeParams = new URLSearchParams()
    safeParams.append('q', queryResult.data)
    
    if (validatedFilters.departmentId) {
      safeParams.append('departmentId', validatedFilters.departmentId.toString())
    }
    if (validatedFilters.medium) {
      safeParams.append('medium', validatedFilters.medium)
    }
    if (validatedFilters.geoLocation) {
      safeParams.append('geoLocation', validatedFilters.geoLocation)
    }
    if (validatedFilters.dateBegin !== undefined) {
      safeParams.append('dateBegin', validatedFilters.dateBegin.toString())
    }
    if (validatedFilters.dateEnd !== undefined) {
      safeParams.append('dateEnd', validatedFilters.dateEnd.toString())
    }
    if (validatedFilters.hasImages !== undefined) {
      safeParams.append('hasImages', validatedFilters.hasImages.toString())
    }
    if (validatedFilters.isHighlight !== undefined) {
      safeParams.append('isHighlight', validatedFilters.isHighlight.toString())
    }
    if (validatedFilters.isOnView !== undefined) {
      safeParams.append('isOnView', validatedFilters.isOnView.toString())
    }

    const url = `${API_CONFIG.BASE_URL}/search?${safeParams.toString()}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Failed to search artworks from Met API:', {
        query: queryResult.data,
        filters: validatedFilters,
        status: response.status,
        statusText: response.statusText,
      })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: response.status }
      )
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Error parsing JSON response:', {
        query: queryResult.data,
        error: jsonError,
      })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 502 }
      )
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error searching artworks:', {
      error,
      errorName: error instanceof Error ? error.name : undefined,
      errorMessage: error instanceof Error ? error.message : undefined,
      errorStack: error instanceof Error ? error.stack : undefined,
    })
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}
