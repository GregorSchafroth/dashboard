// src/app/[projectName]/analytics/components/dailyUsers.tsx

'use client';

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

type DataPoint = {
  date: string;
  count: number;
}

interface DailyUsersProps {
  data: DataPoint[];
}

const DailyUsers = ({ data }: DailyUsersProps) => {
  const chartConfig: ChartConfig = {
    count: {
      label: "Session Count",
      color: "hsl(var(--chart-1))",
    },
  };

  const formatTooltipDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatAxisDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
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
            data={data}
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
              labelFormatter={(label: string) => formatTooltipDate(label)}
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
  );
};

export default DailyUsers;