import { NextResponse } from 'next/server'
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants/config'
import type { DepartmentsResponse } from '@/lib/types/artwork'

export async function GET() {
  try {
    const url = `${API_CONFIG.BASE_URL}/departments`
    
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error('Failed to fetch departments from Met API:', {
        status: response.status,
        statusText: response.statusText,
      })
      
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: response.status }
      )
    }

    let data: DepartmentsResponse
    try {
      data = await response.json()
    } catch (jsonError) {
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
