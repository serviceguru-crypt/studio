"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { summarizeDashboardInsights } from '@/ai/flows/summarize-dashboard-insights';
import { Skeleton } from './ui/skeleton';
import { Wand2 } from 'lucide-react';

interface AiSummaryProps {
    metrics: any;
}

export function AiSummary({ metrics }: AiSummaryProps) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    const getSummary = async () => {
        setLoading(true);
        try {
            const result = await summarizeDashboardInsights({
                metricsData: JSON.stringify(metrics)
            });
            setSummary(result.summary);
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummary('Could not generate insights at this time.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => getSummary(), 1000);
        return () => clearTimeout(timer);
    }, [JSON.stringify(metrics)]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Wand2 className="text-primary"/> AI Insights
                        </CardTitle>
                        <CardDescription>Key takeaways from your dashboard data.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={getSummary} disabled={loading}>
                        Regenerate
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {loading ? (
                    <div className="space-y-3 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {summary}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
