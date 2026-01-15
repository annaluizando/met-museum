import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/constants/config'

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
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
