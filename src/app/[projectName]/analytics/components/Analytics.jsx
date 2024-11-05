"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A simple area chart"

export default function Analytics({ dailyData, monthlyData }) {
  const chartDailyData = dailyData.map(item => ({
    date: item.date,
    count: item.count
  }));

  const chartMonthlyData = monthlyData.map(item => ({
    date: item.date,
    count: item.count
  }));

  const chartConfig = {
    count: {
      label: "Session Count",
      color: "hsl(var(--chart-1))", // Use the same color as before
    },
  };

  // Format function for the tooltip with weekdays
  const formatTooltipDate = (date, isMonthly) => {
    const options = isMonthly ? { year: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Format function for axis labels with weekdays
  const formatAxisDate = (date, isMonthly) => {
    const options = isMonthly ? { year: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

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
                tickFormatter={(value) => formatAxisDate(value, false)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                domain={[0, 'auto']}
              />
              <Tooltip
                labelFormatter={(label) => formatTooltipDate(label, false)}
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
                tickFormatter={(value) => formatAxisDate(value, true)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                domain={[0, 'auto']}
              />
              <Tooltip
                labelFormatter={(label) => formatTooltipDate(label, true)}
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
