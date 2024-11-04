import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import transcriptData from '@/data/getTranscriptDialog1.json'

type ContentChild = {
  type?: 'link'
  url?: string
  children?: Array<{ text: string }>
  text?: string
  fontWeight?: string
}

type ContentBlock = {
  children: ContentChild[]
}

type SlateContent = {
  content: ContentBlock[]
}

type TextPayload = {
  slate?: SlateContent
}

type RequestPayload = {
  query?: string
  label?: string
  type?: string
}

type TranscriptItem = {
  type: string
  payload?: {
    type?: string
    payload?: TextPayload | RequestPayload
  }
}

type TranscriptProps = {
  projectID?: string
  transcriptID: string
}

const extractContent = (item: TranscriptItem): string => {
  if (
    item.type === 'text' &&
    item.payload?.payload &&
    'slate' in item.payload.payload &&
    item.payload.payload.slate?.content
  ) {
    return item.payload.payload.slate.content
      .map((block: ContentBlock) =>
        block.children
          .map((child: ContentChild) => {
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

const TranscriptViewer: React.FC<TranscriptProps> = () =>
  //   {
  //   projectID,
  //   transcriptID,
  // }
  {
    // Using the static JSON data instead of fetching
    const data = transcriptData as TranscriptItem[]

    return (
      <>
        <h2 className='text-2xl mb-5 truncate'>Selected Transcript</h2>
        <hr />
        <div className='h-full w-full py-4 flex flex-col'>
          <div className='flex-1 overflow-auto'>
            <div className='flex flex-col gap-4'>
              {data.map((item, index) => {
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
      </>
    )
  }

export default TranscriptViewer
