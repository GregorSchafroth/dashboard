// src/app/api/transcripts/[transcriptNumber]/bookmark/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Logger } from '@/utils/debug'

interface RouteContext {
  params: Promise<{
    transcriptNumber: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Destructure and await params directly
    const { transcriptNumber } = await params
    Logger.api(`Processing bookmark update for transcript #${transcriptNumber}`)

    const { projectName, bookmarked } = await request.json()
    Logger.api(`Request body:`, { projectName, bookmarked })

    // Convert to number after getting the param
    const transcriptId = parseInt(transcriptNumber)

    if (!projectName || typeof bookmarked !== 'boolean') {
      Logger.api('Invalid request body:', { projectName, bookmarked })
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // First get the project to get its ID
    Logger.api(`Looking for project: ${projectName}`)
    const project = await prisma.project.findUnique({
      where: {
        name: projectName,
      },
    })

    if (!project) {
      Logger.api(`Project not found: ${projectName}`)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    Logger.api(
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

    Logger.api(
      `Successfully updated bookmark for transcript #${transcriptId}`
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.error('Error updating bookmark', error)
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}
