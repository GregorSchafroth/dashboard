// app/api/webhook/voiceflow/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  type?: 'launch'
  data?: {
    message?: string
    text?: string
    [key: string]: unknown
  }
  payload?: {
    message?: string
    text?: string
    query?: string
    label?: string
    slate?: {
      content?: Array<{
        children: Array<{
          text?: string
          type?: 'link'
          url?: string
          fontWeight?: string
          children?: Array<{ text: string }>
        }>
      }>
    }
  }
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

type TranscriptMetrics = {
  messageCount: number
  firstResponse: Date | null
  lastResponse: Date | null
  duration: number | null
  isComplete: boolean
}

type LogData = Record<string, unknown>

// Logger utility with category support
const Logger = {
  sectionStart: (name: string) => {
    if (process.env.DEBUG_API === 'true') {
      console.log('\n' + '='.repeat(50))
      console.log(`🚀 Starting: ${name} at ${new Date().toISOString()}`)
      console.log('='.repeat(50))
    }
  },

  sectionEnd: (name: string, startTime: number) => {
    if (process.env.DEBUG_API === 'true') {
      const duration = Date.now() - startTime
      console.log('-'.repeat(50))
      console.log(`✅ Completed: ${name} in ${duration}ms`)
      console.log('-'.repeat(50) + '\n')
    }
  },

  progress: (message: string) => {
    if (process.env.DEBUG_API === 'true') {
      console.log(`→ ${message}`)
    }
  },

  error: (message: string, error: unknown) => {
    // Always log errors regardless of debug settings
    console.error('❌ Error:', message)
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
      if (error.stack && process.env.DEBUG_API === 'true') {
        console.error(
          `   Stack trace:\n   ${error.stack
            .split('\n')
            .slice(1)
            .join('\n   ')}`
        )
      }
    } else {
      console.error('   Unknown error:', error)
    }
  },

  prisma: (message: string, data?: LogData) => {
    if (process.env.DEBUG_PRISMA === 'true') {
      console.log(`🔋 Prisma:`, message)
      if (data) console.log(JSON.stringify(data, null, 2))
    }
  },

  api: (message: string, data?: LogData) => {
    if (process.env.DEBUG_API === 'true') {
      console.log(`🔌 API:`, message)
      if (data) console.log(JSON.stringify(data, null, 2))
    }
  },
}

async function processWebhookAsync(body: WebhookBody) {
  const processStart = Date.now()
  Logger.sectionStart('Webhook Processing')

  try {
    const voiceflowProjectId = body.voiceflowProjectId
    Logger.progress(`Processing Project ID: ${voiceflowProjectId}`)

    const transcripts = await getTranscripts(voiceflowProjectId)
    Logger.progress(`Fetched ${transcripts.length} transcripts`)

    await processAndSaveTranscripts(voiceflowProjectId, transcripts)

    Logger.sectionEnd('Webhook Processing', processStart)
  } catch (error) {
    Logger.error('Processing failed', error)
    throw error
  }
}

async function analyzeTranscript(
  messages: string[]
): Promise<{ language: string; topic: string; name: string }> {
  const concatenatedMessages = messages.join('\n')

  const prompt = `Analyze the following conversation and provide:
1. The primary language used (return just the ISO 639-1 code, e.g., 'en' for English)
2. A topic summary in the format: "[relevant emoji] 3-5 word description"
   For example: "🚗 car maintenance discussion" or "📱 mobile app development"
3. Any name or identifier for this conversation that can be determined from the content. If no clear name/identifier is found, return "unknown"

The conversation includes both user and AI messages. Consider the full context of the dialogue.

Conversation:
${concatenatedMessages}

Respond in the following JSON format only:
{
  "language": "xx",
  "topic": "[emoji] brief topic here",
  "name": "conversation name or unknown"
}`

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0].message.content
  if (!response) {
    throw new Error('No response from OpenAI')
  }

  try {
    const analysis = JSON.parse(response)

    // Ensure topic has an emoji, add a default if missing
    if (!analysis.topic.match(/^\p{Emoji}/u)) {
      analysis.topic = '💭 ' + analysis.topic
    }

    return {
      language: analysis.language,
      topic: analysis.topic,
      name: analysis.name,
    }
  } catch {
    throw new Error('Failed to parse OpenAI response')
  }
}

function extractMessages(turns: VoiceflowTurn[]): string[] {
  const messages = turns
    .filter((turn) => turn.type === 'text' || turn.type === 'request')
    .map((turn) => {
      try {
        const payload = turn.payload as VoiceflowPayload

        // For text type (AI responses)
        if (turn.type === 'text' && payload.payload?.slate?.content) {
          return payload.payload.slate.content
            .map((block) =>
              block.children
                .map((child) => {
                  if (child.type === 'link' && child.children?.[0]) {
                    return child.children[0].text
                  }
                  return child.text || ''
                })
                .join('')
            )
            .join('\n')
            .trim()
        }

        // For request type (user messages)
        if (turn.type === 'request' && payload.payload) {
          if (payload.payload.query) return payload.payload.query
          if (payload.payload.label) return payload.payload.label
          if (payload.type === 'launch') return 'Conversation started'
        }

        // Fallback checks for other message formats
        if (typeof payload.message === 'string') return payload.message
        if (typeof payload.text === 'string') return payload.text
        if (payload.data?.message) return payload.data.message
        if (payload.data?.text) return payload.data.text

        return ''
      } catch (error) {
        Logger.error('Error extracting message from turn', error)

        return ''
      }
    })
    .filter((message) => message.length > 0)

  Logger.api('Extracted messages', { count: messages.length, messages })
  return messages
}

async function processAndSaveTranscripts(
  voiceflowProjectId: string,
  transcripts: VoiceflowTranscript[]
) {
  Logger.sectionStart('Transcript Processing')
  const startTime = Date.now()

  if (!Array.isArray(transcripts)) {
    Logger.error('Invalid transcripts data', transcripts)
    throw new Error('Transcripts data must be an array')
  }

  const project = await prisma.project.findFirst({
    where: { voiceflowProjectId },
    select: { id: true, lastTranscriptNumber: true, voiceflowApiKey: true },
  })

  if (!project) {
    Logger.error('Project not found', { voiceflowProjectId })
    throw new Error(
      `No project found with Voiceflow Project ID: ${voiceflowProjectId}`
    )
  }

  const BATCH_SIZE = 5
  const DELAY = 200

  for (let i = 0; i < transcripts.length; i += BATCH_SIZE) {
    const batch = transcripts.slice(i, i + BATCH_SIZE)
    Logger.progress(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        transcripts.length / BATCH_SIZE
      )}`
    )

    for (const transcript of batch) {
      const transcriptStart = Date.now()

      await prisma.$transaction(async (tx) => {
        try {
          // Check for existing transcript
          const existingTranscript = await tx.transcript.findFirst({
            where: {
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
            },
            select: {
              id: true,
              transcriptNumber: true,
              turns: {
                select: { voiceflowTurnId: true },
                distinct: ['voiceflowTurnId'],
              },
            },
          })

          Logger.prisma('Checking transcript', {
            id: transcript._id,
            exists: !!existingTranscript,
          })

          let transcriptNumber: number
          let turns: VoiceflowTurn[] = []
          let metrics: TranscriptMetrics = {
            messageCount: 0,
            firstResponse: null,
            lastResponse: null,
            duration: null,
            isComplete: false,
          }

          // Only fetch turns if this is a new transcript or if turns are empty
          if (!existingTranscript || existingTranscript.turns.length === 0) {
            turns = await getTranscriptContent(
              transcript._id,
              voiceflowProjectId,
              project.voiceflowApiKey
            )

            // Calculate metrics with the turns
            metrics = calculateTranscriptMetrics(turns)

            Logger.prisma('Fetched and processed turns', {
              transcriptId: transcript._id,
              turnCount: turns.length,
              metrics: {
                messageCount: metrics.messageCount,
                duration: metrics.duration,
                isComplete: metrics.isComplete,
              },
            })
          }

          // Analyze transcript content if we have turns
          let analysis = {
            language: '',
            topic: '💭 Unknown Topic',
            name: 'unknown',
          }

          if (turns.length > 0) {
            const messages = extractMessages(turns)
            if (messages.length > 0) {
              try {
                analysis = await analyzeTranscript(messages)
                Logger.prisma('Analysis completed', {
                  transcriptId: transcript._id,
                  language: analysis.language,
                  topic: analysis.topic,
                })
              } catch (error) {
                Logger.error('Analysis failed', error)
              }
            } else {
              Logger.prisma('No messages to analyze', {
                transcriptId: transcript._id,
              })
            }
          }

          if (!existingTranscript) {
            // Create new transcript
            const updatedProject = await tx.project.update({
              where: { id: project.id },
              data: { lastTranscriptNumber: { increment: 1 } },
            })
            transcriptNumber = updatedProject.lastTranscriptNumber
          } else {
            transcriptNumber = existingTranscript.transcriptNumber
          }

          // Prepare transcript metadata
          const metadata = {
            creatorID: transcript.creatorID || null,
            unread: transcript.unread || false,
          }

          // Create or update transcript with metrics and analysis
          const savedTranscript = await tx.transcript.upsert({
            where: {
              projectId_voiceflowTranscriptId: {
                projectId: project.id,
                voiceflowTranscriptId: transcript._id || '',
              },
            },
            update: {
              name: transcript.name || analysis.name,
              image: transcript.image ?? null,
              reportTags: Array.isArray(transcript.reportTags)
                ? transcript.reportTags
                : [],
              metadata,
              language: analysis.language || '',
              topic: analysis.topic,
              ...(turns.length > 0 && {
                messageCount: metrics.messageCount,
                isComplete: metrics.isComplete,
                firstResponse: metrics.firstResponse,
                lastResponse: metrics.lastResponse,
                duration: metrics.duration,
              }),
              updatedAt: new Date(),
            },
            create: {
              transcriptNumber,
              projectId: project.id,
              voiceflowTranscriptId: transcript._id || '',
              name: transcript.name || analysis.name,
              image: transcript.image ?? null,
              reportTags: Array.isArray(transcript.reportTags)
                ? transcript.reportTags
                : [],
              metadata,
              language: analysis.language || '',
              topic: analysis.topic,
              messageCount: metrics.messageCount,
              isComplete: metrics.isComplete,
              firstResponse: metrics.firstResponse,
              lastResponse: metrics.lastResponse,
              duration: metrics.duration,
              createdAt: new Date(transcript.createdAt),
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

          Logger.prisma('Transaction completed', {
            transcriptId: transcript._id,
            duration: Date.now() - transcriptStart,
          })
        } catch (error) {
          Logger.error(`Failed to process transcript ${transcript._id}`, error)
          throw error
        }
      })

      await new Promise((resolve) => setTimeout(resolve, DELAY))
    }
  }

  Logger.sectionEnd('Transcript Processing', startTime)
}

function calculateTranscriptMetrics(turns: VoiceflowTurn[]) {
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

  // Check if conversation is complete (ends with a choice or no user response after bot message)
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

async function getTranscripts(voiceflowProjectId: string) {
  Logger.api('Fetching transcripts', { voiceflowProjectId })

  const project = await prisma.project.findFirst({
    where: { voiceflowProjectId },
    select: { voiceflowApiKey: true },
  })

  Logger.prisma('Project lookup result', { found: !!project })

  if (!project) {
    throw new Error(
      `No project found with Voiceflow Project ID: ${voiceflowProjectId}`
    )
  }

  const apiKey = project.voiceflowApiKey

  const url = `https://api.voiceflow.com/v2/transcripts/${voiceflowProjectId}`
  Logger.api('Making Voiceflow API request', { url })

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: apiKey,
    },
  })

  if (!res.ok) {
    Logger.error('Voiceflow API error', { status: res.status })
    throw new Error(`Failed to fetch transcripts: ${res.status}`)
  }

  const data = await res.json()
  Logger.api('Voiceflow API response received', {
    count: Array.isArray(data) ? data.length : 'invalid',
  })

  return Array.isArray(data) ? data : []
}

async function getTranscriptContent(
  transcriptId: string,
  projectId: string,
  apiKey: string
): Promise<VoiceflowTurn[]> {
  // version with start and end date:
  // const url = `https://api.voiceflow.com/v2/transcripts/${voiceflowProjectId}?startDate=${startDate}&endDate=${endDate}`

  // version without start and end date
  const url = `https://api.voiceflow.com/v2/transcripts/${projectId}/${transcriptId}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: apiKey,
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch transcript content: ${res.status}`)
    }

    const turns = await res.json()

    if (!Array.isArray(turns)) {
      Logger.error('Unexpected transcript content format', { transcriptId })
      return []
    }

    // Deduplicate turns by turnID
    const uniqueTurns = Array.from(
      new Map(turns.map((turn) => [turn.turnID, turn])).values()
    )

    Logger.prisma('Fetched transcript content', {
      transcriptId,
      originalTurns: turns.length,
      uniqueTurns: uniqueTurns.length,
    })

    return uniqueTurns
  } catch (error) {
    Logger.error(`Error fetching transcript content: ${transcriptId}`, error)
    throw error
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()
  Logger.sectionStart('Webhook Request')

  try {
    const headersList = headers()
    Logger.api('Headers received', {
      contentType: (await headersList).get('content-type'),
    })

    const rawBody = await req.text()
    let body

    try {
      body = JSON.parse(rawBody)
      Logger.api('Webhook payload parsed', body)
    } catch (parseError) {
      Logger.error('Invalid JSON payload', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Start background processing
    processWebhookAsync(body).catch((error) => {
      Logger.error('Background processing failed', error)
    })

    Logger.progress('Webhook acknowledged, processing started')
    Logger.sectionEnd('Webhook Request', startTime)

    return NextResponse.json({
      success: true,
      message: 'Webhook received, processing in background',
    })
  } catch (error) {
    Logger.error('Webhook handler failed', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}
