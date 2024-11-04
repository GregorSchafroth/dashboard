// src/app/[projectName]/transcripts/[transcriptNumber]/TranscriptViewer.tsx

import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

// Types
type SlateChild = {
  type?: 'link'
  url?: string
  children?: Array<{ text: string }>
  text?: string
  fontWeight?: string
}

type SlateBlock = {
  children: SlateChild[]
}

type SlateContent = {
  content: SlateBlock[]
}

type TextPayload = {
  type: 'text'
  payload: {
    payload: {
      slate: SlateContent
    }
  }
}

type RequestPayload = {
  type: 'request'
  payload: {
    type?: 'launch'
    payload: {
      query?: string
      label?: string
    }
  }
}

type TranscriptItem = TextPayload | RequestPayload


type TranscriptProps = {
  projectName: string
  transcriptNumber: string
}

function formatProjectName(urlProjectName: string): string {
  // Convert from URL format (test-project) to database format (Test Project)
  return urlProjectName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}



// Server-side data fetching function
async function getTranscriptData(projectName: string, transcriptNumber: number) {
  const prisma = new PrismaClient()
  
  try {
    const formattedProjectName = formatProjectName(projectName)
    console.log(`Looking for project: "${formattedProjectName}" (from URL: "${projectName}")`)
    
    // First find the project
    const project = await prisma.project.findFirst({
      where: { 
        name: formattedProjectName
      }
    })

    if (!project) {
      console.log(`Project not found: ${formattedProjectName}`)
      // Let's also check if there are any projects for debugging
      const allProjects = await prisma.project.findMany({
        select: { name: true }
      })
      console.log('Available projects:', allProjects.map(p => p.name))
      return null
    }

    console.log(`Found project ID: ${project.id}`)

    // Then find the transcript using project ID and transcript number
    const transcript = await prisma.transcript.findUnique({
      where: {
        projectId_transcriptNumber: {
          projectId: project.id,
          transcriptNumber: transcriptNumber
        }
      },
      include: {
        turns: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!transcript) {
      console.log(`Transcript #${transcriptNumber} not found for project ${project.name}`)
      return null
    }

    console.log(`Found transcript with ${transcript.turns.length} turns`)
    return transcript
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
  projectName,
  transcriptNumber,
}: TranscriptProps) => {
  console.log(`TranscriptViewer: Loading ${projectName}/${transcriptNumber}`)
  
  try {
    const transcript = await getTranscriptData(
      projectName, 
      parseInt(transcriptNumber)
    )

    if (!transcript) {
      console.log('Transcript not found, redirecting to 404')
      notFound()
    }

    const turns = transcript.turns.map(turn => ({
      type: turn.type,
      payload: turn.payload
    } as TranscriptItem))

    return (
      <div className="h-full flex flex-col">
        <h2 className='text-2xl mb-5 truncate'>
          {transcript.name || `Transcript #${transcriptNumber}`}
        </h2>
        <hr />
        <div className='flex-1 overflow-auto py-4'>
          <div className='flex flex-col gap-4'>
            {turns.map((item, index) => {
              const content = extractContent(item)
              const isUser = item.type === 'request'
              if (!content) return null
              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-lg px-4 py-2 rounded-lg text-sm ${
                      isUser
                        ? 'bg-blue-500 text-white ml-8'
                        : 'bg-gray-100 text-gray-800 mr-8'
                    }`}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in TranscriptViewer:', error)
    throw error // Let Next.js error boundary handle it
  }
}


export default TranscriptViewer