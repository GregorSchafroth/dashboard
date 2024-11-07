// src/app/[projectName]/knowledge/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getProjectFromSlug } from '@/lib/utils'
import { notFound } from 'next/navigation'
import EditableKnowledgeBase from './components/EditableKnowledgeBase'
import { debugLog } from '@/utils/debug'

type Props = {
  params: Promise<{
    projectSlug: string
  }>
}

type FAQ = {
  id?: number
  question: string
  answer: string
}

export default async function KnowledgePage({ params }: Props) {
  const { projectSlug } = await params
  const project = await getProjectFromSlug(projectSlug)

  if (!project) {
    notFound()
  }

  const voiceflowApiKey = project.voiceflowApiKey
  debugLog('api', 'voiceflowApiKey:', voiceflowApiKey)

  const projectId = project.id
  const faqs: FAQ[] = []

  try {
    // Attempt to fetch the knowledge base and its entries
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        projectId: project.id,
        name: 'FAQs',
      },
      include: {
        entries: true,
      },
    })

    // If knowledge base exists, map its entries to FAQs
    if (knowledgeBase?.entries) {
      knowledgeBase.entries.forEach((entry) => {
        faqs.push({
          id: entry.id,
          question: entry.question,
          answer: entry.answer,
        })
      })
    }
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    // Continue with empty faqs array
  }

  async function handleSave(updatedFaqs: FAQ[]) {
    'use server'

    try {
      const kb = await prisma.knowledgeBase.upsert({
        where: {
          projectId_name: {
            projectId: projectId,
            name: 'FAQs',
          },
        },
        create: {
          name: 'FAQs',
          projectId: projectId,
        },
        update: {},
      })

      await prisma.knowledgeEntry.deleteMany({
        where: {
          knowledgeBaseId: kb.id,
        },
      })

      await prisma.knowledgeEntry.createMany({
        data: updatedFaqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          knowledgeBaseId: kb.id,
        })),
      })

      return { success: true }
    } catch (error) {
      console.error('Error saving knowledge base:', error)
      return { success: false, error: 'Failed to save questions' }
    }
  }

  return (
    <div className='flex flex-col'>
      <h2 className='text-2xl m-4'>Questions and Answers</h2>
      <Card className='flex-grow mx-4 p-4'>
        <CardContent className='p-0'>
          <div>
            🇬🇧 Please ensure to save your changes by clicking the &quot;Save
            Questions&quot; button below. <br />
            🇩🇪 Bitte stellen Sie sicher, dass Sie Ihre Änderungen speichern,
            indem Sie unten auf den Knopf &quot;Save Questions&quot; klicken.
          </div>
        </CardContent>
      </Card>
      <div className='flex-grow overflow-hidden p-4'>
        <EditableKnowledgeBase
          initialFaqs={faqs}
          onSave={handleSave}
          voiceflowApiKey={voiceflowApiKey}
        />
      </div>
    </div>
  )
}
