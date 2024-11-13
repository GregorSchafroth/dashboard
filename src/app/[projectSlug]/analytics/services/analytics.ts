// src/app/[projectSlug]/analytics/services/analytics.ts

export type DataPoint = {
  date: string
  count: number
}

export type AnalyticsData = {
  dailyData: DataPoint[]
  monthlyData: DataPoint[]
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

export async function fetchAnalyticsData(
  voiceflowApiKey: string,
  voiceflowProjectId: string,
  timeRange: 'daily' | 'both' = 'both'
): Promise<AnalyticsData> {
  const today = new Date()
  const formatDate = (date: Date) => date.toISOString().split('T')[0]
  let dailyData: DataPoint[] = []
  let monthlyData: DataPoint[] = []

  try {
    // Fetch last 7 days data
    if (timeRange === 'daily' || timeRange === 'both') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(today.getDate() - 6)

      const sevenDaysPromises = Array.from({ length: 7 }, (_, i) => {
        const currentDate = new Date(sevenDaysAgo)
        currentDate.setDate(sevenDaysAgo.getDate() + i)
        const formattedDate = formatDate(currentDate)
        
        return {
          date: formattedDate,
          promise: getSessions(
            voiceflowApiKey,
            voiceflowProjectId,
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
    }

    // Fetch last 12 months data
    if (timeRange === 'both') {
      const monthsPromises = Array.from({ length: 12 }, (_, i) => {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
        
        return {
          month: formatDate(startOfMonth),
          promise: getSessions(
            voiceflowApiKey,
            voiceflowProjectId,
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
    }

    return { dailyData, monthlyData }
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    throw new Error('Failed to fetch analytics data')
  }
}