"use client"

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"

// Define interfaces for our data structures
interface DataPoint {
  date: string
  count: number
}


interface AnalyticsProps {
  dailyData: DataPoint[]
  monthlyData: DataPoint[]
}

export const description = "A simple area chart"

export default function Analytics({ dailyData, monthlyData }: AnalyticsProps) {
  const chartDailyData: DataPoint[] = dailyData.map(item => ({
    date: item.date,
    count: item.count
  }))

  const chartMonthlyData: DataPoint[] = monthlyData.map(item => ({
    date: item.date,
    count: item.count
  }))

  const chartConfig: ChartConfig = {
    count: {
      label: "Session Count",
      color: "hsl(var(--chart-1))", // Use the same color as before
    },
  }

  // Format function for the tooltip with weekdays
  const formatTooltipDate = (date: string, isMonthly: boolean): string => {
    const options: Intl.DateTimeFormatOptions = isMonthly 
      ? { year: 'numeric', month: 'short' } 
      : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  // Format function for axis labels with weekdays
  const formatAxisDate = (date: string, isMonthly: boolean): string => {
    const options: Intl.DateTimeFormatOptions = isMonthly 
      ? { year: 'numeric', month: 'short' } 
      : { weekday: 'short', day: 'numeric', month: 'short' }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 m-4">
      <div className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Daily Users</CardTitle>
            <CardDescription>
              Showing session counts for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartDailyData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => formatAxisDate(value, false)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => value.toString()}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  labelFormatter={(label: string) => formatTooltipDate(label, false)}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="linear"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.4}
                  stroke="hsl(var(--chart-1))"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Users</CardTitle>
            <CardDescription>
              Showing session counts for the past 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartMonthlyData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => formatAxisDate(value, true)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => value.toString()}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  labelFormatter={(label: string) => formatTooltipDate(label, true)}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="linear"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.4}
                  stroke="hsl(var(--chart-1))"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}