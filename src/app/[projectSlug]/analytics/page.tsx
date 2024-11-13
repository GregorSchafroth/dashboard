import { getProjectFromSlug } from '@/lib/utils'
import DailyUsers from './components/DailyUsers'
import MonthlyUsers from './components/MonthlyUsers'
import TranscriptLanguageChart from './components/TranscriptLanguageChart'
import MessageCountChart from './components/MessageCountChart'
import { fetchAnalyticsData } from './services/analytics'
import {
  fetchLanguageDistribution,
  fetchAverageMessageCounts,
} from './services/transcriptAnalytics'
import type { DataPoint } from './services/analytics'
import type {
  LanguageDataPoint,
  MessageCountDataPoint,
} from './services/transcriptAnalytics'

type Props = {
  params: {
    projectSlug: string
  }
  layout?: 'default' | 'compact'
}

// Define base props that all charts share
type BaseChartProps = {
  className?: string
  layout?: 'default' | 'compact'
}

// Define specific chart component types
type DailyUsersComponent = React.ComponentType<
  BaseChartProps & { data: DataPoint[] }
>
type MonthlyUsersComponent = React.ComponentType<
  BaseChartProps & { data: DataPoint[] }
>
type LanguageChartComponent = React.ComponentType<
  BaseChartProps & { data: LanguageDataPoint[] }
>
type MessageCountChartComponent = React.ComponentType<
  BaseChartProps & { data: MessageCountDataPoint[] }
>

type ChartConfig =
  | {
      component: DailyUsersComponent
      data: DataPoint[]
      breakpoint: string
      props?: Record<string, unknown>
    }
  | {
      component: MonthlyUsersComponent
      data: DataPoint[]
      breakpoint: string
      props?: Record<string, unknown>
    }
  | {
      component: LanguageChartComponent
      data: LanguageDataPoint[]
      breakpoint: string
      props?: Record<string, unknown>
    }
  | {
      component: MessageCountChartComponent
      data: MessageCountDataPoint[]
      breakpoint: string
      props?: Record<string, unknown>
    }

const AnalyticsPage = async ({ params, layout = 'default' }: Props) => {
  const { projectSlug } = await params
  const project = await getProjectFromSlug(projectSlug)

  if (!project) {
    return <div>Project not found</div>
  }

  try {
    const [{ dailyData, monthlyData }, languageData, messageCountData] =
      await Promise.all([
        fetchAnalyticsData(project.voiceflowApiKey, project.voiceflowProjectId),
        fetchLanguageDistribution(project.id),
        fetchAverageMessageCounts(project.id),
      ])

    const containerClassName =
      layout === 'compact'
        ? 'flex flex-row gap-4 p-4 overflow-x-hidden'
        : 'grid grid-cols-1 md:grid-cols-2 gap-4 m-4'

    const itemClassName =
      layout === 'compact'
        ? 'flex-1 min-h-0 transition-all duration-300'
        : 'min-h-[300px]'

    const chartConfigs: ChartConfig[] = [
      {
        component: DailyUsers,
        data: dailyData,
        breakpoint: 'block',
      },
      {
        component: MonthlyUsers,
        data: monthlyData,
        breakpoint: 'hidden md:block',
      },
      {
        component: TranscriptLanguageChart,
        data: languageData,
        breakpoint: 'hidden lg:block',
        props: { layout },
      },
      {
        component: MessageCountChart,
        data: messageCountData,
        breakpoint: 'hidden xl:block',
      },
    ]

    return (
      <div className={containerClassName}>
        {chartConfigs.map(
          ({ component: Chart, data, breakpoint, props = {} }, index) => {
            // Type assertion to tell TypeScript that Chart and data match
            const ChartComponent = Chart as React.ComponentType<{
              data: typeof data
              className?: string
              layout?: 'default' | 'compact'
            }>

            const baseClassName = layout === 'compact' ? breakpoint : ''

            return (
              <div
                key={index}
                className={`${itemClassName} ${baseClassName}`}
              >
                <div className='h-full transition-transform hover:scale-[1.02]'>
                  <ChartComponent
                    data={data}
                    className='h-full'
                    layout={layout}
                    {...props}
                  />
                </div>
              </div>
            )
          }
        )}
      </div>
    )
  } catch (error) {
    console.error('Failed to load session data:', error)
    return (
      <div className='flex flex-col lg:flex-row gap-4 m-4'>
        Failed to load analytics data
      </div>
    )
  }
}

export default AnalyticsPage