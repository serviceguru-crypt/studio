
"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCustomerById, Customer } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, Building } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function CustomerDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        if (id) {
            const foundCustomer = getCustomerById(id as string);
            if (foundCustomer) {
                setCustomer(foundCustomer);
            } else {
                router.push('/customers');
            }
        }
    }, [id, router]);

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
                             <p className="text-sm text-muted-foreground">{customer.company}</p>
                        </div>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                             <Button asChild size="sm">
                                <Link href={`/customers/${customer.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Customer
                                </Link>
                            </Button>
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>All contact details for {customer.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
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
                                    <span className="text-muted-foreground">Company</span>
                                </div>
                                <p>{customer.company}</p>
                            </div>
                             <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-muted-foreground">Status</span>
                                </div>
                                <div><Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>{customer.status}</Badge></div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </DashboardLayout>
    );
}
