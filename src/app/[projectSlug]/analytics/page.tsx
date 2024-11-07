// src/app/[projectSlug]/analytics/page.tsx

import { getProjectFromSlug } from '@/lib/utils'
import DailyUsers from './components/DailyUsers'
import MonthlyUsers from './components/MonthlyUsers'
import { fetchAnalyticsData } from './services/analytics'

type Props = {
  params: {
    projectSlug: string
  }
}

const AnalyticsPage = async ({ params }: Props) => {
  const { projectSlug } = await params
  const project = await getProjectFromSlug(projectSlug)

  if (!project) {
    return <div>Project not found</div>
  }

  try {
    const { dailyData, monthlyData } = await fetchAnalyticsData(
      project.voiceflowApiKey,
      project.voiceflowProjectId
    )

    return (
      <div className='flex flex-col lg:flex-row gap-4 m-4'>
        <div className='flex-1 overflow-auto'>
          <DailyUsers data={dailyData} />
        </div>
        <div className='flex-1 overflow-auto'>
          <MonthlyUsers data={monthlyData} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Failed to load session data:', error)
    return <div>Failed to load analytics data</div>
  }
}
export default AnalyticsPage