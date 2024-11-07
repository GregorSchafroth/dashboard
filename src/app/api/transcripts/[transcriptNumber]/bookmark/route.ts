import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { transcriptNumber: string } }
) {
  try {
    // Destructure and await params first
    const { transcriptNumber } = await params
    const { projectName, bookmarked } = await request.json()

    // Convert to number after getting the param
    const transcriptId = parseInt(transcriptNumber)

    if (!projectName || typeof bookmarked !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // First get the project to get its ID
    const project = await prisma.project.findUnique({
      where: {
        name: projectName,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}
