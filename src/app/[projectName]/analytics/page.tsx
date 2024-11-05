// src/app/[projectName]/analytics/page.tsx

import { getProjectFromName } from "@/lib/utils"
import Analytics from './components/Analytics'; // Using the component from your paste


type PageProps = {
  params: Promise<{
    projectName: string
  }>
}


async function getSessions(apiKey: string, projectId: string, startDay: string, endDay: string) {
  const url = 'https://analytics-api.voiceflow.com/v1/query/usage'
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: apiKey,
    },
    body: JSON.stringify({
      query: [
        {
          name: 'sessions',
          filter: {
            projectID: projectId,
            startTime: `${startDay}T00:00:00.000Z`,
            endTime: `${endDay}T23:59:59.999Z`,
          },
        },
      ],
    }),
  }

  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error('Failed to fetch analytics')
  }
  return res.json()
}


const AnalyticsPage = async ({ params }: PageProps) => {
  const { projectName } = await params
  const project = await getProjectFromName(projectName)
  
  if (!project) {
    return <div>Project not found</div>
  }

  let dailyData = []
  let monthlyData = []

  try {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Fetch last 7 days data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 6)

    const sevenDaysPromises = Array.from({ length: 7 }, (_, i) => {
      const currentDate = new Date(sevenDaysAgo)
      currentDate.setDate(sevenDaysAgo.getDate() + i)
      const formattedDate = formatDate(currentDate)
      
      return {
        date: formattedDate,
        promise: getSessions(
          project.voiceflowApiKey,
          project.voiceflowProjectId,
          formattedDate,
          formattedDate
        )
      }
    })

    const sevenDaysResults = await Promise.all(
      sevenDaysPromises.map(p => p.promise)
    )

    dailyData = sevenDaysPromises.map((p, index) => ({
      date: p.date,
      count: sevenDaysResults[index].result[0].count
    }))

    // Fetch last 12 months data
    const monthsPromises = Array.from({ length: 12 }, (_, i) => {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
      
      return {
        month: formatDate(startOfMonth),
        promise: getSessions(
          project.voiceflowApiKey,
          project.voiceflowProjectId,
          formatDate(startOfMonth),
          formatDate(endOfMonth)
        )
      }
    })

    const monthsResults = await Promise.all(
      monthsPromises.map(p => p.promise)
    )

    monthlyData = monthsPromises.map((p, index) => ({
      date: p.month,
      count: monthsResults[index].result[0].count
    }))

    // Sort monthly data from oldest to newest
    monthlyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  } catch (error) {
    console.error('Failed to load session data:', error)
    return <div>Failed to load analytics data</div>
  }

  return <Analytics dailyData={dailyData} monthlyData={monthlyData} />
}
export default AnalyticsPage
