
"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDealById, Deal } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

const getBadgeVariant = (stage: string) => {
    switch (stage.toLowerCase()) {
        case 'closed won':
            return 'default';
        case 'closed lost':
            return 'destructive';
        case 'negotiation':
            return 'secondary';
        default:
            return 'outline';
    }
}

export default function DealDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [deal, setDeal] = useState<Deal | null>(null);

    useEffect(() => {
        if (id) {
            const foundDeal = getDealById(id as string);
            if (foundDeal) {
                setDeal(foundDeal);
            } else {
                // Handle case where deal is not found, maybe redirect or show a message
                router.push('/deals');
            }
        }
    }, [id, router]);

    if (!deal) {
        return (
            <DashboardLayout>
                <div className="flex flex-col w-full">
                    <Header />
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <p>Loading deal information...</p>
                    </main>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col w-full">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            {deal.name}
                        </h1>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                             <Button asChild size="sm">
                                <Link href={`/deals/${deal.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Deal
                                </Link>
                            </Button>
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Deal Details</CardTitle>
                            <CardDescription>Comprehensive information about the deal.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Deal Name</p>
                                <p>{deal.name}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Company</p>
                                <p>{deal.company}</p>
                            </div>
                             <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Value</p>
                                <p>₦{deal.value.toLocaleString()}</p>
                            </div>
                             <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Stage</p>
                                <p><Badge variant={getBadgeVariant(deal.stage)}>{deal.stage}</Badge></p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </DashboardLayout>
    );
}

