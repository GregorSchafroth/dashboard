import { Prisma } from '@prisma/client'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import prisma from '@/lib/prisma'
import { debugLog } from '@/utils/debug'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Types
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

type TranscriptTurn = {
  type: string
  payload: Prisma.JsonValue
}

async function enrichTranscripts() {
  try {
    debugLog('prisma', 'Starting transcript enrichment...')

    const transcripts = await prisma.transcript.findMany({
      where: {
        OR: [{ language: null }, { topic: null }],
      },
      include: {
        turns: {
          select: {
            type: true,
            payload: true,
            startTime: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })

    debugLog('prisma', `Found ${transcripts.length} transcripts to enrich`)

    for (const transcript of transcripts) {
      try {
        debugLog('prisma', `Processing transcript ${transcript.id}...`)

        const messages = transcript.turns
          .map((turn) => extractContent(turn))
          .filter((content) => content.length > 0)

        if (messages.length === 0) {
          debugLog(
            'prisma',
            `No messages found in transcript ${transcript.id}, skipping...`
          )
          continue
        }

        debugLog('prisma', 'Extracted messages:', messages)

        const analysis = await analyzeTranscript(messages)

        await prisma.transcript.update({
          where: { id: transcript.id },
          data: {
            language: transcript.language ?? analysis.language,
            topic: transcript.topic ?? analysis.topic,
          },
        })

        debugLog('prisma', `Successfully enriched transcript ${transcript.id}`)
      } catch (error) {
        console.error(`Error processing transcript ${transcript.id}:`, error)
      }
    }
  } catch (error) {
    debugLog('prisma', 'Error in transcript enrichment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function extractContent(turn: TranscriptTurn): string {
  if (!turn.payload || typeof turn.payload !== 'object') return ''

  const payload = turn.payload as VoiceflowPayload

  // Extract from payload.slate (AI response)
  if (payload.payload?.slate?.content) {
    return payload.payload.slate.content
      .map((block) =>
        block.children
          .map((child) => {
            if (child.type === 'link' && child.children?.[0]) {
              return child.children[0].text
            }
            if (child.fontWeight === '700' && child.text) {
              return child.text
            }
            return child.text || ''
          })
          .join('')
      )
      .join('\n')
  }

  // Extract from various possible message/text locations
  return (
    payload.payload?.query ||
    payload.payload?.label ||
    payload.payload?.message ||
    payload.payload?.text ||
    payload.message ||
    payload.text ||
    payload.data?.message ||
    payload.data?.text ||
    ''
  )
}

async function analyzeTranscript(
  messages: string[]
): Promise<{ language: string; topic: string }> {
  const concatenatedMessages = messages.join('\n')

  const prompt = `Analyze the following conversation and provide:
1. The primary language used (return just the ISO 639-1 code, e.g., 'en' for English)
2. A 3-5 word topic summary that captures the main subject

Note: This is a full conversation including both user and AI messages. Please analyze all messages to determine the actual topic of conversation.

Conversation:
${concatenatedMessages}

Respond in the following JSON format only:
{
  "language": "xx",
  "topic": "brief topic here"
}`

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0].message.content
  if (!response) {
    throw new Error('No response from OpenAI')
  }

  try {
    const analysis = JSON.parse(response)
    return {
      language: analysis.language,
      topic: analysis.topic,
    }
  } catch {
    throw new Error('Failed to parse OpenAI response')
  }
}

// Execute the script
enrichTranscripts()
  .then(() => debugLog('api', 'Enrichment completed successfully'))
  .catch((error) => console.error('Enrichment failed:', error))
