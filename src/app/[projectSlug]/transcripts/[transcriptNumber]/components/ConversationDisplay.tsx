// src/app/[projectSlug]/transcripts/[transcriptNumber]/components/ConversationDisplay.tsx
'use client'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

type ConversationDisplayProps = {
  turns: Array<{
    content: string
    isUser: boolean
  }>
}

const ConversationDisplay = ({ turns }: ConversationDisplayProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [])

  return (
    <div className='flex-1 overflow-auto py-4'>
      <div className='flex flex-col gap-4'>
        {turns.map((item, index) => {
          if (!item.content) return null
          return (
            <div
              key={index}
              className={`flex ${
                item.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-lg px-4 py-2 rounded-lg text-sm ${
                  item.isUser
                    ? 'bg-blue-500 dark:bg-blue-600 text-white ml-8'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-8'
                }`}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {item.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

export default ConversationDisplay