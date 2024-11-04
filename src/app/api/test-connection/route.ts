// app/api/test-connection/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Try to get the count of projects - a simple query to test connection
    const count = await prisma.project.count()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to database' },
      { status: 500 }
    )
  }
}
