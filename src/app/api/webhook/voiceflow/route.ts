// app/api/webhook/voiceflow/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'

type WebhookBody = {
  voiceflowProjectId: string;
}

type VoiceflowTranscript = {
  _id: string;
  name?: string;
  image?: string;
  creatorID?: string;
  unread?: boolean;
  reportTags?: string[];
  createdAt: string;
}

type VoiceflowTurn = {
  turnID: string;
  type: string;
  payload: any;
  startTime: string;
  format: string;
}

const prisma = new PrismaClient()

async function processWebhookAsync(body: WebhookBody) {
  try {
    const voiceflowProjectId = body.voiceflowProjectId
    console.log('Starting async processing for Project ID:', voiceflowProjectId)

    const transcripts = await getTranscripts(voiceflowProjectId)
    await saveTranscriptsToDatabase(voiceflowProjectId, transcripts)

    console.log('Async processing completed successfully')
  } catch (error) {
    console.error('Async processing error:', error)
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
  const today = new Date()
  today.setHours(23, 59, 59, 999) // Set to end of day

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const startDate = formatDate(yesterday)
  const endDate = formatDate(today)

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

async function getTranscriptContent(transcriptId: string, projectId: string, apiKey: string): Promise<VoiceflowTurn[]> {
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
  console.log('Received transcripts data:', JSON.stringify(transcripts, null, 2))

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
    throw new Error(`No project found with Voiceflow Project ID: ${voiceflowProjectId}`)
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
              await new Promise(resolve => setTimeout(resolve, DELAY))
            } catch (error) {
              console.error(`Failed to fetch content for transcript ${transcript._id}:`, error)
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
              reportTags: Array.isArray(transcript.reportTags) ? transcript.reportTags : [],
              metadata,
              updatedAt: new Date(),
            },
            create: {
              transcriptNumber,
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
              name: transcript.name ?? null,
              image: transcript.image ?? null,
              reportTags: Array.isArray(transcript.reportTags) ? transcript.reportTags : [],
              metadata,
              createdAt: transcript.createdAt ? new Date(transcript.createdAt) : new Date(),
              updatedAt: new Date(),
            },
          })

          // Create turns if we have them
          if (turns.length > 0) {
            const turnData = turns.map(turn => ({
              transcriptId: savedTranscript.id,
              type: turn.type,
              payload: turn.payload,
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
    // 1. Validate the incoming webhook
    const headersList = headers()
    console.log('Content-Type:', (await headersList).get('content-type'))

    const rawBody = await req.text()
    let body
    try {
      body = JSON.parse(rawBody)
      console.log('Received webhook payload:', body)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          rawBody: rawBody.substring(0, 100) + '...',
        },
        { status: 400 }
      )
    }

    // 2. Start async processing without awaiting it
    processWebhookAsync(body).catch((error) => {
      console.error('Background processing error:', error)
    })

    // 3. Return immediate success response
    return NextResponse.json({
      success: true,
      message: 'Webhook received, processing started',
      webhookReceived: body,
    })
  } catch (error) {
    console.error('Webhook receipt error:', error)
    return NextResponse.json(
      {
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
