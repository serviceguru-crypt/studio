"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface LineChartCardProps {
    data: { name: string; sales: number }[];
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function LineChartCard({ data }: LineChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>A look at your sales over the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `₦${value / 1000}k`} />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={true} />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
