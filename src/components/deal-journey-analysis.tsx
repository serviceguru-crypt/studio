

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { Wand2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Deal, Tier } from '@/lib/data';
import { analyzeDealJourney } from '@/ai/flows/analyze-deal-journey-flow';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DealJourneyAnalysisProps {
    deal: Deal;
    userTier?: Tier;
}

export function DealJourneyAnalysis({ deal, userTier }: DealJourneyAnalysisProps) {
    const { toast } = useToast();
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const isProFeatureEnabled = userTier === 'Pro' || userTier === 'Enterprise';

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

    const AnalysisButton = () => {
         if (isProFeatureEnabled) {
            return (
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getAnalysis} 
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? 'Analyzing...' : (analysis ? 'Regenerate Analysis' : 'Analyze Deal Journey')}
                </Button>
            );
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative w-full">
                            <Button variant="outline" size="sm" disabled className="w-full">
                                Analyze Deal Journey
                            </Button>
                             <div className="absolute top-[-5px] right-[-5px]">
                                <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400"/>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>This is a Pro feature. <Link href="/pricing" className="underline font-bold">Upgrade your plan</Link> to use AI Deal Analysis.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary"/> AI Deal Analysis
                </CardTitle>
                <CardDescription>Get AI-powered insights on this deal's journey.</CardDescription>
            </CardHeader>
            <CardContent>
                {analysis && !loading && isProFeatureEnabled && (
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
                <AnalysisButton />
            </CardContent>
        </Card>
    );
}
