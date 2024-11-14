// src/app/[projectSlug]/transcripts/[transcriptNumber]/components/TranscriptViewer.tsx

import {
  RequestPayload,
  SlateBlock,
  SlateChild,
  TextPayload,
  TopicTranslations,
  TranscriptData,
  TranscriptItem,
  TranscriptProps,
} from '@/app/[projectSlug]/transcripts/[transcriptNumber]/types'
import prisma from '@/lib/prisma'
import { getProjectFromSlug } from '@/lib/utils'
import { Logger } from '@/utils/debug'
import { notFound } from 'next/navigation'
import ConversationDisplay from './ConversationDisplay'
import TranscriptTitle from './TranscriptTitle'

// Server-side data fetching function
async function getTranscriptData(
  projectSlug: string,
  transcriptNumber: number
): Promise<TranscriptData | null> {
  try {
    const project = await getProjectFromSlug(projectSlug)

    if (!project) {
      return null
    }

    const transcript = await prisma.transcript.findUnique({
      where: {
        projectId_transcriptNumber: {
          projectId: project.id,
          transcriptNumber: transcriptNumber,
        },
      },
      include: {
        turns: {
          orderBy: [
            { startTime: 'asc' },
            { sequence: 'asc' }, // Add sequence as secondary sort
          ],
        },
      },
    })

    if (!transcript) {
      Logger.prisma(
        `Transcript #${transcriptNumber} not found for project ${project.name}`
      )
      return null
    }

    // Add type assertions for both topicTranslations and turns
    const typedTranscript: TranscriptData = {
      id: transcript.id,
      topic: transcript.topic,
      topicTranslations: transcript.topicTranslations as TopicTranslations | null,
      turns: transcript.turns.map(turn => ({
        type: turn.type as 'text' | 'request',
        payload: turn.payload as TextPayload['payload'] | RequestPayload['payload'],
        startTime: turn.startTime,
        sequence: turn.sequence // Add sequence to the turn data
      }))
    }

    Logger.prisma(`Found transcript with ${transcript.turns.length} turns`)
    return typedTranscript
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

const extractContent = (item: TranscriptItem): string => {
  if (
    item.type === 'text' &&
    item.payload?.payload &&
    'slate' in item.payload.payload &&
    item.payload.payload.slate?.content
  ) {
    return item.payload.payload.slate.content
      .map((block: SlateBlock) =>
        block.children
          .map((child: SlateChild) => {
            if (child.type === 'link' && child.children?.[0]) {
              return `<a href="${child.url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">${child.children[0].text}</a>`
            }
            if (child.fontWeight === '700' && child.text) {
              return `**${child.text}**`
            }
            return child.text || ''
          })
          .join('')
      )
      .join('\n')
  } else if (item.type === 'request' && item.payload?.payload) {
    if ('query' in item.payload.payload && item.payload.payload.query) {
      return item.payload.payload.query
    } else if ('label' in item.payload.payload && item.payload.payload.label) {
      return item.payload.payload.label
    } else if (item.payload.type === 'launch') {
      return 'Conversation started'
    }
  }
  return ''
}

const TranscriptViewer = async ({
  projectSlug,
  transcriptNumber,
}: TranscriptProps) => {
  Logger.components(
    `TranscriptViewer: Loading ${projectSlug}/${transcriptNumber}`
  )

  try {
    const transcript = await getTranscriptData(
      projectSlug,
      parseInt(transcriptNumber)
    )

    if (!transcript) {
      Logger.components('Transcript not found, redirecting to 404')
      notFound()
    }

    const turns = transcript.turns.map(
      (turn) =>
        ({
          type: turn.type,
          payload: turn.payload,
          sequence: turn.sequence,
        } as TranscriptItem)
    )

    const formattedTurns = turns.map((item, index) => ({
      content: extractContent(item),
      isUser: item.type === 'request',
      timestamp: transcript.turns[index].startTime?.toISOString(),
      sequence: transcript.turns[index].sequence
    }))

    const displayableTurns = formattedTurns.filter((turn) => turn.content)
    const turnsWithIndex = displayableTurns.map((turn, index) => ({
      ...turn,
      displayIndex: index + 1,
    }))

    return (
      <div className='h-full flex flex-col'>
        <TranscriptTitle
          transcriptNumber={transcriptNumber}
          topic={transcript.topic}
          topicTranslations={transcript.topicTranslations}
        />
        <hr />
        <ConversationDisplay turns={turnsWithIndex} />
      </div>
    )
  } catch (error) {
    console.error('Error in TranscriptViewer:', error)
    throw error
  }
}

export default TranscriptViewer