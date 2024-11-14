// src/app/[projectSlug]/transcripts/[transcriptNumber]/not-found.tsx
'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className='flex-1 flex items-center justify-center flex-col gap-4'>
      <h2 className='text-xl font-semibold'>
        {t('transcripts.notFound.title')}
      </h2>
      <p className='text-muted-foreground'>
        {t('transcripts.notFound.message')}
      </p>
      <Link href='..' className='text-blue-500 hover:text-blue-600'>
        {t('transcripts.notFound.backLink')}
      </Link>
    </div>
  )
}