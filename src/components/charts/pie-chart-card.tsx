
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface PieChartCardProps {
    data: { name: string; count: number; fill: string }[];
}

export function PieChartCard({ data }: PieChartCardProps) {
    const chartData = Array.isArray(data) ? data : [];
    const chartConfig = chartData.reduce((acc, item) => {
        const key = item.name.toLowerCase().replace(/ /g, '');
        acc[key] = { label: item.name, color: item.fill };
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
                        <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Legend />
                        <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {chartData.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.name}`} 
                                    fill={chartConfig[entry.name.toLowerCase().replace(/ /g, '')]?.color} 
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
