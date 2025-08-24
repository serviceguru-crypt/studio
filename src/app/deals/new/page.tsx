
"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
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

const dealFormSchema = z.object({
  name: z.string().min(3, { message: "Deal name must be at least 3 characters." }),
  company: z.string().min(2, { message: "Company must be at least 2 characters." }),
  value: z.coerce.number().min(0, { message: "Value must be a positive number." }),
  stage: z.enum(["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function NewDealPage() {
  const { toast } = useToast();
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      name: "",
      company: "",
      value: 0,
      stage: "Qualification",
    },
  });

  function onSubmit(data: DealFormValues) {
    console.log(data);
    toast({
      title: "Deal Created",
      description: "The new deal has been added successfully.",
    });
    form.reset();
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
                  <CardTitle>Add New Deal</CardTitle>
                  <CardDescription>Fill out the form below to add a new deal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ERP System for AgriMart" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. AgriMart" {...field} />
                        </FormControl>
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
                          <Input type="number" placeholder="e.g. 7500000" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/deals">Cancel</Link>
                  </Button>
                  <Button type="submit">Add Deal</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </main>
      </div>
    </DashboardLayout>
  );
}
