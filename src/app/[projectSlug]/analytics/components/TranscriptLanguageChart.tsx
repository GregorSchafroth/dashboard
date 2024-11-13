// src/app/[projectSlug]/analytics/componentsTranscriptLanguageChart.tsx
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
import { getLanguageDisplay } from '@/lib/languages/utils'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { LanguageDataPoint } from '../services/transcriptAnalytics'
import { cn } from '@/lib/utils'

// Configuration constant for easy modification
const COMPACT_MODE_LANGUAGE_LIMIT = 7

type TranscriptLanguageChartProps = {
  data: LanguageDataPoint[]
  className?: string
  layout?: 'default' | 'compact'
}

const TranscriptLanguageChart = ({
  data,
  className,
  layout = 'default',
}: TranscriptLanguageChartProps) => {
  const { language } = useLanguage()
  const t = translations[language]

  const chartConfig: ChartConfig = {
    count: {
      label: t.analytics.count,
      color: 'hsl(var(--chart-1))',
    },
  }

  // Sort data by count in descending order and limit if in compact mode
  const sortedData = [...data].sort((a, b) => b.count - a.count)
  const displayData =
    layout === 'compact'
      ? sortedData.slice(0, COMPACT_MODE_LANGUAGE_LIMIT)
      : sortedData

  // Calculate if we're showing limited data
  const isLimited =
    layout === 'compact' && data.length > COMPACT_MODE_LANGUAGE_LIMIT

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{t.analytics.languageDistribution}</CardTitle>
        {layout === 'default' && (
          <CardDescription>
            {t.analytics.descriptions.languageDistribution}
            {isLimited &&
              ` (${t.analytics.descriptions.topLanguagesShown.replace(
                '{count}',
                COMPACT_MODE_LANGUAGE_LIMIT.toString()
              )})`}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className='pl-0'>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={displayData}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='language'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={(props) => {
                const { x, y, payload } = props
                const { flag } = getLanguageDisplay(payload.value)
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor='middle' fontSize='16'>
                      {flag}
                    </text>
                  </g>
                )
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => value.toString()}
              domain={[0, 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null

                const dataPoint = payload[0].payload as LanguageDataPoint
                const { flag, name } = getLanguageDisplay(
                  dataPoint.language,
                  language
                )

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    labelFormatter={() => `${flag} ${name}`}
                    formatter={(value) => (
                      <div className='flex justify-between items-center w-full'>
                        <span>{t.analytics.count}</span>
                        <span className='ml-2 font-mono'>
                          {value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  />
                )
              }}
            />
            <Bar
              dataKey='count'
              fill='hsl(var(--chart-1))'
              radius={[4, 4, 0, 0]}
              name={t.analytics.count}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TranscriptLanguageChart
