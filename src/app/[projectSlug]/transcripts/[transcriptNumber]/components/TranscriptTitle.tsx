// src/app/[projectSlug]/transcripts/[transcriptNumber]/components/TranscriptTitle.tsx
'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { TranscriptTitleProps } from '../types'

const TranscriptTitle = ({
  transcriptNumber,
  topic,
  topicTranslations,
}: TranscriptTitleProps) => {
  const { language } = useLanguage()

  return (
    <h2 className='text-2xl mb-5 truncate'>
      {`Transcript #${transcriptNumber}`}
      {(topicTranslations || topic) && (
        <span className='ml-2'>
          |{' '}
          {topicTranslations
            ? topicTranslations[language as keyof typeof topicTranslations]
            : topic}
        </span>
      )}
    </h2>
  )
}

export default TranscriptTitle
