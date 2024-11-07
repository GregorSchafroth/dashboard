import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { debugLog } from '@/utils/debug'

export async function PUT(
  request: NextRequest,
  { params }: { params: { transcriptNumber: string } }
) {
  try {
    // Destructure and await params first
    const { transcriptNumber } = await params
    debugLog(
      'api',
      `Processing bookmark update for transcript #${transcriptNumber}`
    )

    const { projectName, bookmarked } = await request.json()
    debugLog('api', `Request body:`, { projectName, bookmarked })

    // Convert to number after getting the param
    const transcriptId = parseInt(transcriptNumber)

    if (!projectName || typeof bookmarked !== 'boolean') {
      debugLog('api', 'Invalid request body:', { projectName, bookmarked })
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // First get the project to get its ID
    debugLog('api', `Looking for project: ${projectName}`)
    const project = await prisma.project.findUnique({
      where: {
        name: projectName,
      },
    })

    if (!project) {
      debugLog('api', `Project not found: ${projectName}`)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    debugLog(
      'api',
      `Found project ID: ${project.id}, updating transcript #${transcriptId}`
    )

    // Update the bookmark status using projectId and transcriptNumber
    await prisma.transcript.update({
      where: {
        projectId_transcriptNumber: {
          projectId: project.id,
          transcriptNumber: transcriptId,
        },
      },
      data: {
        bookmarked,
      },
    })

    debugLog(
      'api',
      `Successfully updated bookmark for transcript #${transcriptId}`
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    debugLog('api', 'Error updating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}
