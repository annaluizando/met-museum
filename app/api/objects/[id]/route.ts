import { NextResponse } from 'next/server'
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'
import { artworkIdSchema } from '@/lib/validations/artwork'

/**
 * Route Handler: Proxy for fetching individual artwork by ID
 * 
 * Purpose: Prevents CORS issues for client-side requests
 * Server Components should use direct API calls (no proxy needed)
 * 
 * @see https://nextjs.org/docs/app/guides/backend-for-frontend
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = artworkIdSchema.safeParse(id)
    
    if (!result.success) {
      console.error('Invalid artwork ID:', { id, errors: result.error.issues })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 400 }
      )
    }
    
    const sanitizedId = result.data

    const url = `${API_CONFIG.BASE_URL}/objects/${sanitizedId}`
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Failed to fetch artwork from Met API:', {
        id: sanitizedId,
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
        id: sanitizedId,
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
    console.error('Error fetching artwork:', {
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
