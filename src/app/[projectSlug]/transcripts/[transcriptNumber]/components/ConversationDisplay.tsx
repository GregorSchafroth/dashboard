// src/app/[projectSlug]/transcripts/[transcriptNumber]/components/ConversationDisplay.tsx
'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { ConversationDisplayProps } from '../types'

const ConversationDisplay = ({ turns }: ConversationDisplayProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [])

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ''
    
    // Create date object from timestamp
    const date = new Date(timestamp)
    
    // Get the base formatted string without milliseconds
    const baseFormatted = date.toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    // Extract milliseconds
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
    
    // Combine the formatted date with milliseconds
    return `${baseFormatted}.${milliseconds}`
  }


  const t = translations[language].transcripts.viewer

  return (
    <div className="flex-1 overflow-auto py-4">
      <div className="flex flex-col gap-4">
        <TooltipProvider>
          {turns.map((item, index) => {
            if (!item.content) return null

            const tooltipContent = (
              <div className="text-sm">
                {item.timestamp && (
                  <div>{t.time}: {formatTimestamp(item.timestamp)}</div>
                )}
                {item.displayIndex && (
                  <div>{t.message} #{item.displayIndex}</div>
                )}
              </div>
            )

            return (
              <div
                key={index}
                className={`flex ${
                  item.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`max-w-lg px-4 py-2 rounded-lg text-sm cursor-help
                        ${
                          item.isUser
                            ? "bg-blue-500 dark:bg-blue-600 text-white ml-8"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-8"
                        }`}
                    >
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side={item.isUser ? "left" : "right"} align="start">
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </TooltipProvider>
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

export default ConversationDisplay