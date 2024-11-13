// src/app/[projectSlug]/analytics/components/DailyUsers.tsx

'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

type DataPoint = {
  date: string
  count: number
}

type DailyUsersProps = {
  data: DataPoint[]
  className?: string
  layout?: 'default' | 'compact'
}

const DailyUsers = ({ data, className, layout = 'default'  }: DailyUsersProps) => {
  const { language } = useLanguage()
  const t = translations[language]

  const chartConfig: ChartConfig = {
    count: {
      label: t.analytics.sessionCount,
      color: 'hsl(var(--chart-1))',
    },
  }

  const languageToLocale: Record<string, string> = {
    en: 'en-US',
    de: 'de-DE',
    // Add other languages as needed
  }

  const currentLocale = languageToLocale[language] || language

  const formatAxisDate = (date: string): string => {
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
        <CardTitle>{t.analytics.dailyUsers}</CardTitle>
        {layout === 'default' && (
          <CardDescription>{t.analytics.descriptions.dailyUsers}</CardDescription>
        )}
      </CardHeader>
      <CardContent className='pl-0'>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => formatAxisDate(value)}
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
                    year: 'numeric',
                  }}
                />
              }
            />
            <Area
              dataKey='count'
              type='linear'
              fill='hsl(var(--chart-1))'
              fillOpacity={0.4}
              stroke='hsl(var(--chart-1))'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default DailyUsers
