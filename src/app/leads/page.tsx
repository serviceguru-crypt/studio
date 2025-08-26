
"use client";

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/lib/data';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const leadFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  phone: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

function AddLeadDialog({ open, onOpenChange, onLeadAdded }: { open: boolean, onOpenChange: (open: boolean) => void, onLeadAdded: () => void }) {
    const { toast } = useToast();
    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues: {
            name: "",
            email: "",
            organization: "",
            phone: "",
        },
    });

    async function onSubmit(data: LeadFormValues) {
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to create lead');
            }
            
            toast({
                title: "Lead Added",
                description: `${data.name} has been successfully added as a new lead.`,
            });
            onOpenChange(false);
            form.reset();
            onLeadAdded(); // Callback to refresh the leads list
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not create the lead. Please try again.",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new lead.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Bisi Adebayo" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. bisi@example.com" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="organization"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Innovate Nigeria" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+234..." {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Adding..." : "Add Lead"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function LeadsPage() {
    const [isAddLeadOpen, setIsAddLeadOpen] = React.useState(false);
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    const fetchLeads = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/leads');
            if (!response.ok) {
                throw new Error('Failed to fetch leads');
            }
            const data = await response.json();
            setLeads(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch leads.'
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleImport = () => {
        toast({
            title: "Coming Soon!",
            description: "The ability to import leads from a CSV file is under development.",
        });
    };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Leads</h1>
                    <p className="text-muted-foreground">Manage your incoming leads before converting them.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleImport}>
                        <Upload className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Import
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddLeadOpen(true)}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                            Add Lead
                        </span>
                    </Button>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Lead Pipeline</CardTitle>
                    <CardDescription>
                        A list of all potential customers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Table>
                           <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Created</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Created</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">
                                        <div>{lead.name}</div>
                                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                                    </TableCell>
                                    <TableCell>{lead.organization}</TableCell>
                                    <TableCell><Badge variant="secondary">{lead.status}</Badge></TableCell>
                                    <TableCell className="hidden md:table-cell">{format(new Date(lead.createdAt), 'PP')}</TableCell>
                                    <TableCell>
                                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled>
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                    {!isLoading && leads.length === 0 && (
                         <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">You have no leads yet.</p>
                            <Button variant="link" className="mt-2" onClick={() => setIsAddLeadOpen(true)}>Add your first lead</Button>
                        </div>
                    )}
                </CardContent>
             </Card>
        </main>
      </div>
      <AddLeadDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} onLeadAdded={fetchLeads} />
    </DashboardLayout>
  );
}
