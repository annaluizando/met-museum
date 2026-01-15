import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/constants/config'

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
    
    if (!searchParams.get('q')) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const url = `${API_CONFIG.BASE_URL}/search?${searchParams.toString()}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to search artworks' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error searching artworks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
