// app/api/webhook/voiceflow/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'

// Types for the webhook payload
type WebhookBody = {
  voiceflowProjectId: string;
  // Add other webhook payload fields if needed
}

// Types for the transcript data
type VoiceflowTranscript = {
  _id: string;
  name?: string;
  image?: string;
  creatorID?: string;
  unread?: boolean;
  reportTags?: string[];
  createdAt: string;
  // Add other transcript fields if needed
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

  // Sort transcripts by creation date (oldest first)
  const sortedTranscripts = [...transcripts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // Find the Project record using VoiceflowProjectId (outside of transaction)
  const project = await prisma.project.findFirst({
    where: {
      voiceflowProjectId,
    },
    select: {
      id: true,
      lastTranscriptNumber: true,
    },
  })

  if (!project) {
    throw new Error(
      `No project found with Voiceflow Project ID: ${voiceflowProjectId}`
    )
  }

  // Process transcripts in batches of 10
  const BATCH_SIZE = 10
  for (let i = 0; i < sortedTranscripts.length; i += BATCH_SIZE) {
    const batch = sortedTranscripts.slice(i, i + BATCH_SIZE)

    await prisma.$transaction(async (tx) => {
      // Process each transcript in the current batch
      for (const transcript of batch) {
        if (!transcript || typeof transcript !== 'object') {
          console.error('Invalid transcript object:', transcript)
          continue
        }

        try {
          // Find existing transcript to determine if we need a new number
          const existingTranscript = await tx.transcript.findFirst({
            where: {
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
            },
            select: {
              transcriptNumber: true,
            },
          })

          let transcriptNumber: number

          if (!existingTranscript) {
            // Only increment the counter for new transcripts
            const updatedProject = await tx.project.update({
              where: { id: project.id },
              data: { lastTranscriptNumber: { increment: 1 } },
            })
            transcriptNumber = updatedProject.lastTranscriptNumber
          } else {
            transcriptNumber = existingTranscript.transcriptNumber
          }

          // Create basic metadata object from available fields
          const metadata = {
            creatorID: transcript.creatorID || null,
            unread: transcript.unread || false,
          }

          // Create or update the transcript
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

          console.log(
            `Saved/updated transcript with ID: ${savedTranscript.id} and number: ${transcriptNumber}, created at: ${transcript.createdAt}`
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

    // Add a small delay between batches to prevent overwhelming the database
    if (i + BATCH_SIZE < sortedTranscripts.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
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
