// app/[projectSlug]/transcripts/page.tsx
'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

// Let's add the transcripts translations to the translations file first
declare module '@/i18n/translations' {
  type TranslationsType = {
    transcripts: {
      selectTranscript: string
    }
  }
}

export default function TranscriptsPage() {
  const { language } = useLanguage()

  return (
    <div className='flex items-center justify-center h-full text-muted-foreground'>
      {translations[language].transcripts.selectTranscript}
    </div>
  )
}