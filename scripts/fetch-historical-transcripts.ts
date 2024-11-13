// scripts/fetch-historical-transcripts.ts

import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import prisma from '@/lib/prisma'

dotenv.config()

const projectId = 1

type VoiceflowTurn = {
  turnID: string
  type: string
  payload: VoiceflowPayload
  startTime: string
  format: string
}

type VoiceflowPayload = {
  message?: string
  text?: string
  data?: Record<string, unknown>
  choices?: Array<{ name: string; actions: Array<Record<string, unknown>> }>
  success?: boolean
  time?: number
  type?: string
  payload?: {
    slate?: {
      id?: string
      content?: Array<{
        children: Array<{
          text?: string
          type?: string
          url?: string
          children?: Array<{ text: string }>
        }>
      }>
      messageDelayMilliseconds?: number
    }
    message?: string
    delay?: number
    buttons?: Array<{
      name: string
      request: {
        type: string
        payload: {
          label: string
          actions: Array<Record<string, unknown>>
        }
      }
    }>
    blockID?: string
    diagramID?: string
    path?: string
  }
}

type VoiceflowTranscript = {
  _id: string
  name?: string | null
  image?: string | null
  creatorID?: string | null
  unread?: boolean
  reportTags?: string[]
  createdAt: string
}

type TranscriptMetrics = {
  messageCount: number
  firstResponse: Date | null
  lastResponse: Date | null
  duration: number | null
  isComplete: boolean
}

type ProjectWithAuth = {
  id: number
  name: string
  voiceflowProjectId: string
  voiceflowApiKey: string
}

async function fetchAllHistoricalTranscripts(projectId: number) {
  try {
    console.log('Starting historical transcript fetch...')

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        voiceflowProjectId: true,
        voiceflowApiKey: true,
      },
    })

    if (!project) {
      console.error(`No project found with ID: ${projectId}`)
      return
    }

    console.log(`Processing project: ${project.name}`)

    const url = `https://api.voiceflow.com/v2/transcripts/${project.voiceflowProjectId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: project.voiceflowApiKey,
      },
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch transcripts for project ${project.name}:`,
        response.status
      )
      return
    }

    const transcripts = (await response.json()) as VoiceflowTranscript[]
    console.log(
      `Found ${transcripts.length} transcripts for project ${project.name}`
    )

    let processedCount = 0
    const BATCH_SIZE = 5
    const DELAY = 1000 // 1 second between batches

    for (let i = 0; i < transcripts.length; i += BATCH_SIZE) {
      const batch = transcripts.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (transcript) => {
          try {
            await processTranscript(project, transcript)
            processedCount++
            console.log(
              `Processed ${processedCount}/${transcripts.length} transcripts for ${project.name}`
            )
          } catch (error) {
            console.error(
              `Error processing transcript ${transcript._id}:`,
              error
            )
          }
        })
      )

      if (i + BATCH_SIZE < transcripts.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY))
      }
    }

    console.log('\nHistorical transcript fetch completed!')
  } catch (error) {
    console.error('Error in historical transcript fetch:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function processTranscript(
  project: ProjectWithAuth,
  transcript: VoiceflowTranscript
) {
  const url = `https://api.voiceflow.com/v2/transcripts/${project.voiceflowProjectId}/${transcript._id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: project.voiceflowApiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch transcript content: ${response.status}`)
  }

  const turns = (await response.json()) as VoiceflowTurn[]
  const metrics = calculateTranscriptMetrics(turns)

  await prisma.$transaction(async (tx) => {
    const existingTranscript = await tx.transcript.findFirst({
      where: {
        projectId: project.id,
        voiceflowTranscriptId: transcript._id,
      },
      select: {
        id: true,
        transcriptNumber: true,
      },
    })

    let transcriptNumber: number
    if (!existingTranscript) {
      const updatedProject = await tx.project.update({
        where: { id: project.id },
        data: { lastTranscriptNumber: { increment: 1 } },
      })
      transcriptNumber = updatedProject.lastTranscriptNumber
    } else {
      transcriptNumber = existingTranscript.transcriptNumber
    }

    const transcriptData = {
      transcriptNumber,
      projectId: project.id,
      voiceflowTranscriptId: transcript._id,
      name: transcript.name ?? null,
      image: transcript.image ?? null,
      reportTags: Array.isArray(transcript.reportTags)
        ? transcript.reportTags
        : [],
      metadata: {
        creatorID: transcript.creatorID || null,
        unread: transcript.unread || false,
      } as Prisma.InputJsonValue,
      messageCount: metrics.messageCount,
      isComplete: metrics.isComplete,
      firstResponse: metrics.firstResponse,
      lastResponse: metrics.lastResponse,
      duration: metrics.duration,
      updatedAt: new Date(),
    }

    const savedTranscript = await tx.transcript.upsert({
      where: {
        projectId_voiceflowTranscriptId: {
          projectId: project.id,
          voiceflowTranscriptId: transcript._id,
        },
      },
      create: {
        ...transcriptData,
        createdAt: new Date(transcript.createdAt),
      },
      update: transcriptData,
    })

    if (existingTranscript) {
      await tx.turn.deleteMany({
        where: { transcriptId: existingTranscript.id },
      })
    }

    await tx.turn.createMany({
      data: turns.map((turn) => ({
        transcriptId: savedTranscript.id,
        type: turn.type,
        payload: turn.payload as Prisma.InputJsonValue, // Changed here too
        startTime: new Date(turn.startTime),
        format: turn.format,
        voiceflowTurnId: turn.turnID,
      })),
    })
  })
}

function calculateTranscriptMetrics(turns: VoiceflowTurn[]): TranscriptMetrics {
  const messageCount = turns.filter(
    (turn) => turn.type === 'text' || turn.type === 'request'
  ).length

  const timestamps = turns.map((turn) => new Date(turn.startTime))
  const firstResponse =
    timestamps.length > 0
      ? new Date(Math.min(...timestamps.map((date) => date.getTime())))
      : null
  const lastResponse =
    timestamps.length > 0
      ? new Date(Math.max(...timestamps.map((date) => date.getTime())))
      : null

  const duration =
    firstResponse && lastResponse
      ? Math.round((lastResponse.getTime() - firstResponse.getTime()) / 1000)
      : null

  const lastTurn = turns[turns.length - 1]
  const isComplete =
    lastTurn?.type === 'choice' ||
    (lastTurn?.type === 'text' &&
      !turns.some(
        (t) =>
          t.type === 'request' &&
          new Date(t.startTime) > new Date(lastTurn.startTime)
      ))

  return {
    messageCount,
    firstResponse,
    lastResponse,
    duration,
    isComplete,
  }
}

// Execute the script
fetchAllHistoricalTranscripts(projectId)
  .then(() => console.log('Script completed successfully'))
  .catch((error) => console.error('Script failed:', error))
