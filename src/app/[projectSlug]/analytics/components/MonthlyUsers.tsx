// src/app/[projectSlug]/analytics/components/MonthlyUsers.tsx
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

interface MonthlyUsersProps {
  data: DataPoint[]
  className?: string
  layout?: 'default' | 'compact'
}

const MonthlyUsers = ({ data, className, layout = 'default' }: MonthlyUsersProps) => {
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
  }

  const currentLocale = languageToLocale[language] || language

  const formatAxisDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
    }
    return new Date(date).toLocaleDateString(currentLocale, options)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{t.analytics.monthlyUsers}</CardTitle>
        {layout === 'default' && (
          <CardDescription>
            {t.analytics.descriptions.monthlyUsers}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className='pl-0'>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
              tickFormatter={formatAxisDate}
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
                    year: 'numeric',
                    month: 'short',
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

export default MonthlyUsers
