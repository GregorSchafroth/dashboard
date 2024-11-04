// app/api/webhook/voiceflow/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

type WebhookBody = {
  voiceflowProjectId: string
}

type VoiceflowTranscript = {
  _id: string
  name?: string
  image?: string
  creatorID?: string
  unread?: boolean
  reportTags?: string[]
  createdAt: string
}

type VoiceflowPayload = {
  message?: string
  text?: string
  data?: Record<string, unknown>
  choices?: Array<{ name: string; actions: Array<Record<string, unknown>> }>
  success?: boolean
}

type VoiceflowTurn = {
  turnID: string
  type: string
  payload: VoiceflowPayload
  startTime: string
  format: string
}

async function processWebhookAsync(body: WebhookBody) {
  try {
    const voiceflowProjectId = body.voiceflowProjectId
    console.log('Starting async processing for Project ID:', voiceflowProjectId)

    const startTime = Date.now()

    const transcripts = await getTranscripts(voiceflowProjectId)
    console.log(
      `Fetched ${transcripts.length} transcripts in ${Date.now() - startTime}ms`
    )

    const processingStartTime = Date.now()
    await saveTranscriptsToDatabase(voiceflowProjectId, transcripts)
    console.log(
      `Processed transcripts in ${Date.now() - processingStartTime}ms`
    )

    console.log(`Total processing time: ${Date.now() - startTime}ms`)
  } catch (error) {
    console.error('Async processing error:', error)
    throw error
  }
}

async function getTranscripts(voiceflowProjectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      voiceflowProjectId: voiceflowProjectId,
    },
    select: {
      voiceflowApiKey: true,
    },
  })

  if (!project) {
    throw new Error(
      `No project found with Voiceflow Project ID: ${voiceflowProjectId}`
    )
  }

  const apiKey = project.voiceflowApiKey
  console.log('apiKey:', apiKey)

  // Get yesterday's date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0) // Set to start of day

  // Get today's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999) // Set to end of day

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const startDate = formatDate(yesterday)
  const endDate = formatDate(tomorrow)

  console.log(`Fetching transcripts from ${startDate} to ${endDate}`)

  // version with start and end date:
  const url = `https://api.voiceflow.com/v2/transcripts/${voiceflowProjectId}?startDate=${startDate}&endDate=${endDate}`

  // version without start and end date
  // const url = `https://api.voiceflow.com/v2/transcripts/${voiceflowProjectId}`

  const options: RequestInit = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: apiKey,
    },
  }

  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Failed to fetch transcripts: ${res.status}`)
  }
  const data = await res.json()

  // Ensure we have an array of transcripts
  if (!Array.isArray(data)) {
    console.error('Unexpected API response format:', data)
    return []
  }

  return data
}

async function getTranscriptContent(
  transcriptId: string,
  projectId: string,
  apiKey: string
): Promise<VoiceflowTurn[]> {
  const url = `https://api.voiceflow.com/v2/transcripts/${projectId}/${transcriptId}`
  const options: RequestInit = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: apiKey,
    },
  }

  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Failed to fetch transcript content: ${res.status}`)
  }
  const turns = await res.json()

  if (!Array.isArray(turns)) {
    console.error('Unexpected transcript content format:', turns)
    return []
  }

  return turns
}

async function saveTranscriptsToDatabase(
  voiceflowProjectId: string,
  transcripts: VoiceflowTranscript[]
) {
  console.log(
    'Received transcripts data:',
    JSON.stringify(transcripts, null, 2)
  )

  if (!Array.isArray(transcripts)) {
    console.error('Transcripts data is not an array:', transcripts)
    throw new Error('Transcripts data must be an array')
  }

  const project = await prisma.project.findFirst({
    where: {
      voiceflowProjectId,
    },
    select: {
      id: true,
      lastTranscriptNumber: true,
      voiceflowApiKey: true,
    },
  })

  if (!project) {
    throw new Error(
      `No project found with Voiceflow Project ID: ${voiceflowProjectId}`
    )
  }

  const BATCH_SIZE = 5 // Reduced due to content fetching
  const DELAY = 200 // ms between content fetches

  for (let i = 0; i < transcripts.length; i += BATCH_SIZE) {
    const batch = transcripts.slice(i, i + BATCH_SIZE)

    await prisma.$transaction(async (tx) => {
      for (const transcript of batch) {
        if (!transcript || typeof transcript !== 'object') {
          console.error('Invalid transcript object:', transcript)
          continue
        }

        try {
          // Find existing transcript
          const existingTranscript = await tx.transcript.findFirst({
            where: {
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
            },
            select: {
              transcriptNumber: true,
              turns: { select: { voiceflowTurnId: true } },
            },
          })

          let transcriptNumber: number
          let turns: VoiceflowTurn[] = []

          // Only fetch content for new transcripts or if no turns exist
          if (!existingTranscript || existingTranscript.turns.length === 0) {
            try {
              turns = await getTranscriptContent(
                transcript._id,
                voiceflowProjectId,
                project.voiceflowApiKey
              )
              await new Promise((resolve) => setTimeout(resolve, DELAY))
            } catch (error) {
              console.error(
                `Failed to fetch content for transcript ${transcript._id}:`,
                error
              )
            }
          }

          if (!existingTranscript) {
            const updatedProject = await tx.project.update({
              where: { id: project.id },
              data: { lastTranscriptNumber: { increment: 1 } },
            })
            transcriptNumber = updatedProject.lastTranscriptNumber
          } else {
            transcriptNumber = existingTranscript.transcriptNumber
          }

          const metadata = {
            creatorID: transcript.creatorID || null,
            unread: transcript.unread || false,
          }

          // Create or update transcript
          const savedTranscript = await tx.transcript.upsert({
            where: {
              projectId_voiceflowTranscriptId: {
                projectId: project.id,
                voiceflowTranscriptId: transcript._id || '',
              },
            },
            update: {
              name: transcript.name ?? null,
              image: transcript.image ?? null,
              reportTags: Array.isArray(transcript.reportTags)
                ? transcript.reportTags
                : [],
              metadata,
              updatedAt: new Date(),
            },
            create: {
              transcriptNumber,
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
              name: transcript.name ?? null,
              image: transcript.image ?? null,
              reportTags: Array.isArray(transcript.reportTags)
                ? transcript.reportTags
                : [],
              metadata,
              createdAt: transcript.createdAt
                ? new Date(transcript.createdAt)
                : new Date(),
              updatedAt: new Date(),
            },
          })

          // Create turns if we have them
          if (turns.length > 0) {
            const turnData = turns.map((turn) => ({
              transcriptId: savedTranscript.id,
              type: turn.type,
              payload: turn.payload as Prisma.InputJsonValue,
              startTime: new Date(turn.startTime),
              format: turn.format,
              voiceflowTurnId: turn.turnID,
            }))

            await tx.turn.createMany({
              data: turnData,
              skipDuplicates: true,
            })
          }

          console.log(
            `Saved transcript ${savedTranscript.id} (#${transcriptNumber}) with ${turns.length} turns`
          )
        } catch (error) {
          console.error(
            `Error saving transcript ${transcript?._id || 'unknown'}:`,
            error instanceof Error ? error.message : String(error)
          )
          throw error
        }
      }
    })

    if (i + BATCH_SIZE < transcripts.length) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
}

export async function POST(req: Request) {
  try {
    const headersList = headers()
    console.log('Content-Type:', (await headersList).get('content-type'))

    const rawBody = await req.text()
    let body
    try {
      body = JSON.parse(rawBody)
      console.log('Received webhook payload:', body)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Process with timeout handling
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error('Processing timeout')), 25000) // 25 second timeout
    )

    try {
      await Promise.race([processWebhookAsync(body), timeoutPromise])
      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
      })
    } catch (error: unknown) {
      // Explicitly type error as unknown
      if (error instanceof Error) {
        // Type guard to check if error is Error instance
        if (error.message === 'Processing timeout') {
          console.log('Processing timeout reached, but webhook received')
          return NextResponse.json({
            success: true,
            message: 'Webhook received, processing in background',
          })
        }
      }
      throw error
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}
