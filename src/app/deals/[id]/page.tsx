
"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Deal, Customer } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);

    const fetchDealDetails = useCallback(async () => {
        if (id) {
            try {
                const dealResponse = await fetch(`/api/deals/${id}`);
                if (!dealResponse.ok) {
                    throw new Error('Failed to fetch deal');
                }
                const foundDeal: Deal = await dealResponse.json();

                // Ensure closeDate is a Date object
                if (typeof foundDeal.closeDate === 'string') {
                    foundDeal.closeDate = new Date(foundDeal.closeDate);
                }
                setDeal(foundDeal);

                // Fetch customer details
                const customerResponse = await fetch(`/api/customers/${foundDeal.customerId}`);
                 if (!customerResponse.ok) {
                    throw new Error('Failed to fetch customer for the deal');
                }
                const foundCustomer: Customer = await customerResponse.json();
                setCustomer(foundCustomer);

            } catch (error) {
                console.error(error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch deal details." });
                router.push('/deals');
            }
        }
    }, [id, router, toast]);
    
    useEffect(() => {
        fetchDealDetails();
    }, [fetchDealDetails]);


    if (!deal || !customer) {
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

    const isValidDate = deal.closeDate && !isNaN(deal.closeDate.getTime());

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
                                <p className="text-sm font-medium text-muted-foreground">Organization</p>
                                <p>{customer?.organization || 'N/A'}</p>
                            </div>
                             <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Value</p>
                                <p>₦{deal.value.toLocaleString()}</p>
                            </div>
                             <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Stage</p>
                                <div><Badge variant={getBadgeVariant(deal.stage)}>{deal.stage}</Badge></div>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Expected Close Date</p>
                                <p>{isValidDate ? format(deal.closeDate, "PPP") : "Not set"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </DashboardLayout>
    );
}
