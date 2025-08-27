
"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Deal, Customer, getDealById, getCustomerById, Activity } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MessageCircle, PhoneCall, Users, StickyNote, Workflow } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
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

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Email': return <MessageCircle className="h-5 w-5" />;
        case 'Call': return <PhoneCall className="h-5 w-5" />;
        case 'Meeting': return <Users className="h-5 w-5" />;
        case 'Note': return <StickyNote className="h-5 w-5" />;
        case 'Update': return <Workflow className="h-5 w-5" />;
        default: return <StickyNote className="h-5 w-5" />;
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
                const foundDeal = await getDealById(id as string);
                if (!foundDeal) {
                    throw new Error('Failed to fetch deal');
                }
                 if (foundDeal.activity) {
                    foundDeal.activity.forEach(act => {
                        if (typeof act.date === 'string') {
                            act.date = new Date(act.date);
                        }
                    });
                } else {
                    foundDeal.activity = [];
                }

                setDeal(foundDeal);

                const foundCustomer = await getCustomerById(foundDeal.customerId);
                if (!foundCustomer) {
                    throw new Error('Failed to fetch customer for the deal');
                }
                setCustomer(foundCustomer);

            } catch (error: any) {
                console.error(error);
                toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch deal details." });
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

    const isValidDate = deal.closeDate && !isNaN(new Date(deal.closeDate).getTime());

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
                                    Update Deal
                                </Link>
                            </Button>
                        </div>
                    </div>
                     <div className="grid gap-6 md:grid-cols-3">
                         <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Deal Details</CardTitle>
                                    <CardDescription>Comprehensive information about the deal.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Deal Name</p>
                                        <p>{deal.name}</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                        <Link href={`/customers/${customer.id}`} className="text-primary hover:underline">{customer.name}</Link>
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
                                        <p>{isValidDate ? format(new Date(deal.closeDate), "PPP") : "Not set"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                         <div className="md:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Deal Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {deal.activity && deal.activity.length > 0 ? (
                                         <div className="space-y-6">
                                            {deal.activity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item: Activity) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <ActivityIcon type={item.type} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline justify-between">
                                                            <p className="font-semibold">{item.type}</p>
                                                            <p className="text-xs text-muted-foreground" title={format(new Date(item.date), "PPpp")}>
                                                                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                                                    </div>
                                                </div>
                                            ))}
                                         </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">No activity logged for this deal yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                     </div>
                </main>
            </div>
        </DashboardLayout>
    );
}
