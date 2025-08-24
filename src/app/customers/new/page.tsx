
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
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  company: z.string().min(2, { message: "Company must be at least 2 characters." }),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function NewCustomerPage() {
  const { toast } = useToast();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
  });

  function onSubmit(data: CustomerFormValues) {
    console.log(data);
    toast({
      title: "Customer Created",
      description: "The new customer has been added successfully.",
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
                            <CardTitle>Add New Customer</CardTitle>
                            <CardDescription>Fill out the form below to add a new customer to your CRM.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Adekunle Ciroma" {...field} />
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
                                            <Input placeholder="e.g. kunle@techco.ng" {...field} />
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
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. +2348012345678" {...field} />
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
                                            <Input placeholder="e.g. TechCo Nigeria" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/customers">Cancel</Link>
                            </Button>
                            <Button type="submit">Add Customer</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </main>
      </div>
    </DashboardLayout>
  );
}
