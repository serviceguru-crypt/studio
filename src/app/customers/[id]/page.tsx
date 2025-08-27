
"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCustomerById, Customer, addActivity } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, Building, MessageSquarePlus, MessageCircle, PhoneCall, Users, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmailComposer } from '@/components/email-composer';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const activityFormSchema = z.object({
  type: z.enum(['Email', 'Call', 'Meeting', 'Note']),
  notes: z.string().min(1, 'Notes cannot be empty.'),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Email': return <MessageCircle className="h-5 w-5" />;
        case 'Call': return <PhoneCall className="h-5 w-5" />;
        case 'Meeting': return <Users className="h-5 w-5" />;
        case 'Note': return <StickyNote className="h-5 w-5" />;
        default: return <StickyNote className="h-5 w-5" />;
    }
}

export default function CustomerDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activityFormSchema),
        defaultValues: {
            type: 'Note',
            notes: '',
        },
    });

    const fetchCustomer = useCallback(async () => {
        if (id) {
            try {
                const data = await getCustomerById(id as string);
                if (!data) {
                    toast({
                        variant: "destructive",
                        title: "Customer not found",
                        description: "The customer you are looking for does not exist.",
                    });
                    router.push('/customers');
                    return;
                }
                
                // Ensure all activity dates are proper Date objects
                if (data.activity) {
                    data.activity.forEach(act => {
                        if (act.date && typeof act.date.toDate === 'function') {
                            act.date = act.date.toDate();
                        } else if (typeof act.date === 'string') {
                            act.date = new Date(act.date);
                        }
                    });
                } else {
                    data.activity = [];
                }
                
                setCustomer(data);
            } catch (error: any) {
                console.error("Failed to fetch customer:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message || "Could not fetch customer details.",
                });
                router.push('/customers');
            }
        }
    }, [id, router, toast]);
    
    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    const onSubmitActivity = async (data: ActivityFormValues) => {
        if(id) {
            await addActivity(id as string, data);
            toast({
                title: "Activity Logged",
                description: "The new activity has been added to the customer's record.",
            });
            form.reset();
            fetchCustomer(); // Refetch customer to update activity list
        }
    }


    if (!customer) {
        return (
            <DashboardLayout>
                <div className="flex flex-col w-full">
                    <Header />
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <p>Loading customer information...</p>
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
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={customer.avatar} alt={customer.name} data-ai-hint="person avatar"/>
                            <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
                             <p className="text-sm text-muted-foreground">{customer.organization}</p>
                        </div>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                             <Button variant="outline" size="sm" onClick={() => setIsComposerOpen(true)}>
                                <MessageSquarePlus className="h-4 w-4 mr-2" />
                                Compose AI Email
                            </Button>
                             <Button asChild size="sm">
                                <Link href={`/customers/${customer.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Customer
                                </Link>
                            </Button>
                        </div>
                    </div>
                     <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                     <div className="grid gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Email</span>
                                        </div>
                                        <a href={`mailto:${customer.email}`} className="text-primary hover:underline">{customer.email}</a>
                                    </div>
                                     <div className="grid gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Phone</span>
                                        </div>
                                        <p>{customer.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Organization</span>
                                        </div>
                                        <p>{customer.organization}</p>
                                    </div>
                                     <div className="grid gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-muted-foreground">Status</span>
                                        </div>
                                        <div><Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>{customer.status}</Badge></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Log Activity</CardTitle>
                                    <CardDescription>Add a new call, email, meeting, or note.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmitActivity)} className="space-y-4">
                                            <FormField 
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Activity Type</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select activity type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Note">Note</SelectItem>
                                                                <SelectItem value="Email">Email</SelectItem>
                                                                <SelectItem value="Call">Call</SelectItem>
                                                                <SelectItem value="Meeting">Meeting</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField 
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notes</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Log details of the interaction..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit">Log Activity</Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity Feed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.activity && customer.activity.length > 0 ? (
                                         <div className="space-y-6">
                                            {customer.activity.sort((a,b) => b.date.getTime() - a.date.getTime()).map(item => {
                                                const activityDate = new Date(item.date);
                                                const isActivityDateValid = isValid(activityDate);

                                                return (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <ActivityIcon type={item.type} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline justify-between">
                                                            <p className="font-semibold">{item.type}</p>
                                                            {isActivityDateValid ? (
                                                            <p className="text-xs text-muted-foreground" title={format(activityDate, "PPpp")}>
                                                                {formatDistanceToNow(activityDate, { addSuffix: true })}
                                                            </p>
                                                            ) : <p className="text-xs text-muted-foreground">Invalid date</p>}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                                                    </div>
                                                </div>
                                            )})}
                                         </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">No activity logged for this customer yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                     </div>
                </main>
            </div>
             {customer && (
                <EmailComposer 
                    isOpen={isComposerOpen}
                    onOpenChange={setIsComposerOpen}
                    customerName={customer.name}
                    organization={customer.organization}
                />
            )}
        </DashboardLayout>
    );
}
