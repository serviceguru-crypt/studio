
"use client"

import { useEffect, useCallback, useRef, useState } from 'react';
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
import { getCustomerById, updateCustomer, Customer } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';


const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  status: z.enum(["Active", "Inactive"]),
  avatar: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function EditCustomerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      status: "Active",
      avatar: "",
    }
  });

  const fetchCustomer = useCallback(async () => {
    if (id) {
        try {
            const customer = await getCustomerById(id as string);
            if (!customer) {
              throw new Error('Customer not found');
            }
            form.reset({
              ...customer,
              phone: customer.phone || "", // Ensure phone is not undefined
            });
            if (customer.avatar) {
              setAvatarPreview(customer.avatar);
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not fetch customer details."
            });
            router.push('/customers');
        }
    }
  }, [id, form, router, toast]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        form.setValue('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: CustomerFormValues) {
    try {
        await updateCustomer(id as string, data);
        toast({
            title: "Customer Updated",
            description: "The customer has been updated successfully.",
        });
        router.push(`/customers/${id}`);
        router.refresh(); // Refresh to show updated data if the user navigates back
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not update the customer. Please try again.",
        });
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
                  <CardTitle>Edit Customer</CardTitle>
                  <CardDescription>Update the details of the customer below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || undefined} alt={form.watch('name')} />
                        <AvatarFallback>
                            <User className="h-10 w-10"/>
                        </AvatarFallback>
                    </Avatar>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={form.formState.isSubmitting}>
                        Upload Photo
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Adekunle Ciroma" {...field} disabled={form.formState.isSubmitting} />
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
                          <Input placeholder="e.g. kunle@techco.ng" {...field} disabled={form.formState.isSubmitting} />
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
                          <Input placeholder="e.g. +2348012345678" {...field} disabled={form.formState.isSubmitting} />
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
                          <Input placeholder="e.g. TechCo Nigeria" {...field} disabled={form.formState.isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/customers/${id}`}>Cancel</Link>
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
