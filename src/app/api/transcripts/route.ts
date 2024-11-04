// app/api/transcripts/route.ts
import { debugLog } from '@/utils/debug'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectName = searchParams.get('projectName')

  if (!projectName) {
    return NextResponse.json(
      { error: 'Project name is required' },
      { status: 400 }
    )
  }

  try {
    debugLog('api', 'Searching transcripts for project:', projectName)

    // First, find the project by name
    const project = await prisma.project.findFirst({
      where: {
        name: projectName,
      },
    })

    if (!project) {
      console.log('Project not found for name:', projectName)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    debugLog('api', 'Found project:', project?.id)

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

    debugLog('api', `Found ${transcripts.length} transcripts`)
    
    if (transcripts.length > 0) {
      debugLog('api', 'First transcript:', transcripts[0])
    }

    return NextResponse.json({ data: transcripts })
  } catch (error) {
    console.error('Failed to fetch transcripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
}
