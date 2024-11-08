// src/app/api/test-prisma/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Try a simple query - adjust the model name to one you have
    const result = await prisma.user.findFirst()
    return NextResponse.json({ status: 'Connected to database', data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    return NextResponse.json({ status: 'Error', error: message }, { status: 500 })
  }
}