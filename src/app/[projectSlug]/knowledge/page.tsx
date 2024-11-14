// src/app/[projectSlug]/knowledge/page.tsx
import { prisma } from '@/lib/prisma'
import { getProjectFromSlug } from '@/lib/utils'
import { Logger } from '@/utils/debug'
import { notFound } from 'next/navigation'
import ClientKnowledgePage from './components/ClientKnowledgePage'

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
  Logger.api('voiceflowApiKey:', voiceflowApiKey)

  const projectId = project.id
  const faqs: FAQ[] = []

  try {
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        projectId: project.id,
        name: 'FAQs',
      },
      include: {
        entries: true,
      },
    })

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
    <ClientKnowledgePage 
      faqs={faqs}
      onSave={handleSave}
      voiceflowApiKey={voiceflowApiKey}
    />
  )
}