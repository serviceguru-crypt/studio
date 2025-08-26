
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface PieChartCardProps {
    data: { name: string; count: number; fill: string }[];
}

export function PieChartCard({ data }: PieChartCardProps) {
    const chartData = Array.isArray(data) ? data : [];
    
    // Create a config for the tooltip and legend.
    const chartConfig = chartData.reduce((acc, item) => {
        // Create a key from the item name, e.g., "Social Media" -> "socialmedia"
        const key = item.name.toLowerCase().replace(/ /g, '');
        // Use the fill color directly from the data
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
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.fill} // Use the direct fill color from the data
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
