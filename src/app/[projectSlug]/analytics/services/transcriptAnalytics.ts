// src/app/[projectSlug]/analytics/services/transcriptAnalytics.ts

import prisma from '@/lib/prisma'

export type LanguageDataPoint = {
  language: string
  count: number
}

export async function fetchLanguageDistribution(projectId: number): Promise<LanguageDataPoint[]> {
  const languageData = await prisma.transcript.groupBy({
    by: ['language'],
    where: {
      projectId,
      language: {
        not: null
      }
    },
    _count: true,
    orderBy: {
      language: 'asc'  // Changed from _count._all to language
    }
  })

  // Transform and sort the data after we get it
  const transformedData = languageData.map(item => ({
    language: item.language || 'Unknown',
    count: item._count
  }))

  // Sort by count descending
  return transformedData.sort((a, b) => b.count - a.count)
}

export type MessageCountDataPoint = {
  date: string
  averageCount: number
  totalConversations: number
}

export async function fetchAverageMessageCounts(projectId: number): Promise<MessageCountDataPoint[]> {
  // Get data for the last 30 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30)

  const dailyStats = await prisma.$queryRaw<Array<{
    date: Date;
    averageCount: number;
    totalConversations: number;
  }>>`
    SELECT 
      DATE("createdAt") as date,
      ROUND(AVG("messageCount")) as "averageCount",
      COUNT(*) as "totalConversations"
    FROM "Transcript"
    WHERE 
      "projectId" = ${projectId}
      AND "createdAt" >= ${sevenDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  return dailyStats.map(stat => ({
    date: stat.date.toISOString().split('T')[0],
    averageCount: Number(stat.averageCount),
    totalConversations: Number(stat.totalConversations)
  }))
}