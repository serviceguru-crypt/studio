
"use client"

import { useEffect, useState, useCallback } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getDealById, updateAndRescoreDeal, getCustomers, Deal, Customer } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const dealFormSchema = z.object({
  name: z.string().min(3, { message: "Deal name must be at least 3 characters." }),
  customerId: z.string({ required_error: "Please select a customer." }),
  value: z.coerce.number().min(0, { message: "Value must be a positive number." }),
  stage: z.enum(["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]),
  closeDate: z.date({ required_error: "A close date is required." }),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function EditDealPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [originalDeal, setOriginalDeal] = useState<Deal | null>(null);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      name: '',
      value: 0,
    }
  });

  const fetchDealAndCustomers = useCallback(async () => {
    if (id) {
        try {
            const custs = await getCustomers();
            setCustomers(custs);
            const deal = await getDealById(id as string);
            if (!deal) {
              throw new Error('Deal not found');
            }
            setOriginalDeal(deal);
            form.reset({
              ...deal,
              value: deal.value || 0,
              closeDate: deal.closeDate ? new Date(deal.closeDate) : new Date(),
            });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch deal details." });
            router.push('/deals');
        }
    }
  }, [id, form, router, toast]);

  useEffect(() => {
    fetchDealAndCustomers();
  }, [fetchDealAndCustomers]);

  async function onSubmit(data: DealFormValues) {
    if (id && originalDeal) {
        try {
            await updateAndRescoreDeal(id as string, originalDeal, data);
            toast({
                title: "Deal Updated",
                description: "The deal has been updated successfully and is being re-scored.",
            });
            router.push(`/deals/${id}`);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Could not update the deal." });
        }
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Update Deal</CardTitle>
                  <CardDescription>Update the details of the deal below. Changes will be logged in the activity feed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ERP System for AgriMart" {...field} disabled={form.formState.isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.organization})
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value (₦)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 7500000" {...field} disabled={form.formState.isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a deal stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Qualification">Qualification</SelectItem>
                            <SelectItem value="Proposal">Proposal</SelectItem>
                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                            <SelectItem value="Closed Won">Closed Won</SelectItem>
                            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="closeDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expected Close Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={form.formState.isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/deals/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </main>
      </div>
    </DashboardLayout>
  );
}
