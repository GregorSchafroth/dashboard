export type TopicTranslations = {
  en: string
  de: string
}

export type SlateChild = {
  type?: 'link'
  url?: string
  children?: Array<{ text: string }>
  text?: string
  fontWeight?: string
}

export type SlateBlock = {
  children: SlateChild[]
}

export type SlateContent = {
  content: SlateBlock[]
}

export type TextPayload = {
  type: 'text'
  payload: {
    payload: {
      slate: SlateContent
    }
  }
}

export type RequestPayload = {
  type: 'request'
  payload: {
    type?: 'launch'
    payload: {
      query?: string
      label?: string
    }
  }
}

export type TranscriptItem =
  | TextPayload
  | (RequestPayload & {
      sequence: number | null // Updated to match Prisma schema
    })

export type Turn = {
  type: 'text' | 'request'
  payload: TextPayload['payload'] | RequestPayload['payload']
  startTime: Date | null
  sequence: number | null // Updated to match Prisma schema
}

export type TranscriptData = {
  id: number
  turns: Turn[]
  topic: string | null
  topicTranslations: TopicTranslations | null
}

export type TranscriptProps = {
  projectSlug: string
  transcriptNumber: string
}

export type FormattedTurn = {
  content: string
  isUser: boolean
  timestamp?: string
  displayIndex?: number
  sequence: number | null // Updated to match Prisma schema
}

export type TranscriptTitleProps = {
  transcriptNumber: string | number
  topic: string | null
  topicTranslations: {
    en: string
    de: string
  } | null
}

export type ConversationDisplayProps = {
  turns: Array<{
    content: string
    isUser: boolean
    timestamp?: string
    displayIndex?: number
    sequence: number | null // Updated to match Prisma schema
  }>
}
