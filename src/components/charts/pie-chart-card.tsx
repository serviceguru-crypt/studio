
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface PieChartCardProps {
    data: { name: string; count: number; fill: string }[];
}

export function PieChartCard({ data }: PieChartCardProps) {
    const chartConfig = data.reduce((acc, item) => {
        acc[item.name.toLowerCase().replace(/ /g, '')] = { label: item.name, color: item.fill };
        return acc;
    }, {} as any) satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of leads from various sources.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto w-full aspect-square max-h-[300px]">
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
