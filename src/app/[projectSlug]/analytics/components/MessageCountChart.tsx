// src/app/[projectSlug]/analytics/components/MessageCountChart.tsx

'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { MessageCountDataPoint } from '../services/transcriptAnalytics'
import { cn } from '@/lib/utils'

type MessageCountChartProps = {
  data: MessageCountDataPoint[]
  className?: string
  layout?: 'default' | 'compact'
}

const MessageCountChart = ({ data, className, layout = 'default' }: MessageCountChartProps) => {
  const { language } = useLanguage()
  const t = translations[language]

  const languageToLocale: Record<string, string> = {
    en: 'en-US',
    de: 'de-DE',
  }
  const currentLocale = languageToLocale[language] || language

  const chartConfig: ChartConfig = {
    averageCount: {
      label: t.analytics.averageMessages,
      color: 'hsl(var(--chart-1))',
    },
    totalConversations: {
      label: t.analytics.totalConversations,
      color: 'hsl(var(--chart-2))',
    },
  }

  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
    return new Date(date).toLocaleDateString(currentLocale, options)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className='truncate'>{t.analytics.messageCount}</CardTitle>
        {layout === 'default' && (
          <CardDescription>
            {t.analytics.descriptions.messageCount}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className='pl-0'>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => value.toString()}
              domain={[0, 'auto']}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  indicator='line'
                  formatDate={true}
                  dateFormatOptions={{
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }}
                />
              }
            />
            <Line
              type='monotone'
              dataKey='averageCount'
              stroke='hsl(var(--chart-1))'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default MessageCountChart
