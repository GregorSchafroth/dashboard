// src/app/[projectSlug]/knowledge/components/ClientKnowledgePage.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import EditableKnowledgeBase from './EditableKnowledgeBase'
import { useTranslation } from '@/hooks/useTranslation'

type FAQ = {
  id?: number
  question: string
  answer: string
}

export default function ClientKnowledgePage({ 
  faqs, 
  onSave, 
  voiceflowApiKey 
}: { 
  faqs: FAQ[], 
  onSave: (faqs: FAQ[]) => Promise<{ success: boolean, error?: string }>,
  voiceflowApiKey: string
}) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col'>
      <h2 className='text-2xl m-4'>{t('knowledge.title')}</h2>
      <Card className='flex-grow mx-4 p-4'>
        <CardContent className='p-0'>
          <div>{t('knowledge.saveWarning')}</div>
        </CardContent>
      </Card>
      <div className='flex-grow overflow-hidden p-4'>
        <EditableKnowledgeBase
          initialFaqs={faqs}
          onSave={onSave}
          voiceflowApiKey={voiceflowApiKey}
        />
      </div>
    </div>
  )
}