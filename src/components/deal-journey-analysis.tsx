
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Deal } from '@/lib/data';
import { analyzeDealJourney } from '@/ai/flows/analyze-deal-journey-flow';

interface DealJourneyAnalysisProps {
    deal: Deal;
}

export function DealJourneyAnalysis({ deal }: DealJourneyAnalysisProps) {
    const { toast } = useToast();
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const getAnalysis = async () => {
        setLoading(true);
        setAnalysis('');
        try {
            const activityHistory = deal.activity
                ?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(a => `${new Date(a.date).toLocaleDateString()}: ${a.notes}`)
                .join('\n');
            
            if (!activityHistory) {
                setAnalysis("Not enough activity to analyze this deal's journey.");
                return;
            }

            const result = await analyzeDealJourney({
                dealName: deal.name,
                dealValue: deal.value,
                finalStage: deal.stage,
                activityHistory: activityHistory
            });

            setAnalysis(result.analysis);
        } catch (error) {
            console.error('Error generating deal analysis:', error);
            setAnalysis('Could not generate analysis at this time.');
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'There was an error generating the deal journey analysis.'
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary"/> AI Deal Analysis
                </CardTitle>
                <CardDescription>Get AI-powered insights on this deal's journey.</CardDescription>
            </CardHeader>
            <CardContent>
                {analysis && !loading && (
                     <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                        {analysis}
                    </p>
                )}
                {loading && (
                     <div className="space-y-3 mb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                )}
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getAnalysis} 
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? 'Analyzing...' : (analysis ? 'Regenerate Analysis' : 'Analyze Deal Journey')}
                </Button>
            </CardContent>
        </Card>
    );
}
