// app/api/transcripts/route.ts
import { Logger } from '@/utils/debug'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectName = searchParams.get('projectName')

  // Validate project name to prevent querying with invalid names
  if (!projectName || projectName === 'error' || projectName === 'Error') {
    return NextResponse.json(
      { error: 'Invalid project name' },
      { status: 400 }
    )
  }

  try {
    // Test database connection first
    try {
      await prisma.$connect()
      Logger.prisma('Successfully connected to database')
    } catch (connectError) {
      console.error('Database connection failed:', connectError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    Logger.api('Searching transcripts for project:', projectName)

    // First, find the project by name
    const project = await prisma.project.findFirst({
      where: {
        name: projectName,
      },
    })

    if (!project) {
      Logger.prisma('Project not found for name:', projectName)
      return NextResponse.json(
        { 
          error: 'Project not found',
          details: `No project found with name: ${projectName}`
        }, 
        { status: 404 }
      )
    }

    Logger.api('Found project:', project?.id)

    // Then get the transcripts for that project
    const transcripts = await prisma.transcript.findMany({
      where: {
        projectId: project.id,
        isArchived: false,
      },
      include: {
        sessions: {
          select: {
            voiceflowSessionId: true,
            browser: true,
            device: true,
            os: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    Logger.api(`Found ${transcripts.length} transcripts`)
    
    if (transcripts.length > 0) {
      Logger.api('First transcript:', transcripts[0])
    }

    return NextResponse.json({ data: transcripts })
  } catch (error) {
    console.error('Failed to fetch transcripts:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch transcripts',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}