import { NextResponse } from 'next/server'
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'

/**
 * Route Handler: Proxy for fetching departments
 * 
 * Purpose: Prevents CORS issues for client-side requests
 * Server Components should use direct API calls (no proxy needed)
 * 
 * @see https://nextjs.org/docs/app/guides/backend-for-frontend
 */
export async function GET() {
  try {
    const url = `${API_CONFIG.BASE_URL}/departments`
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      // Log error server-side for debugging (includes status code and details)
      console.error('Failed to fetch departments from Met API:', {
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
      // Log error server-side for debugging (includes full error details)
      console.error('Error parsing JSON response:', {
        error: jsonError,
      })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 502 }
      )
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    // Log full error details server-side for debugging
    console.error('Error fetching departments:', {
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
