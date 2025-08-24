
"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, File, PlusCircle, ListFilter } from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomers, Customer } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';

export default function CustomersPage() {
  const [allCustomers, setAllCustomers] = React.useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>([]);
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const customers = getCustomers();
    setAllCustomers(customers);
    setFilteredCustomers(customers);
  }, []);

  const filterCustomers = React.useCallback((tab: string, term: string) => {
    let customers = [...allCustomers];
    
    // Filter by tab
    if (tab !== 'all') {
      customers = customers.filter(customer => customer.status.toLowerCase() === tab);
    }
    
    // Filter by search term
    if (term) {
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(term.toLowerCase()) ||
        customer.company.toLowerCase().includes(term.toLowerCase()) ||
        customer.email.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredCustomers(customers);
  }, [allCustomers]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterCustomers(value, searchTerm);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterCustomers(activeTab, term);
  };
  
  const handleExport = () => {
    const dataToExport = filteredCustomers.map(({ id, avatar, ...rest }) => rest);
    exportToCsv('customers.csv', dataToExport);
  }


  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Status</DropdownMenuItem>
                    <DropdownMenuItem>Company</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1" asChild>
                  <Link href="/customers/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                      Add Customer
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value={activeTab}>
                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>
                        Manage your customers and view their sales history.
                        </CardDescription>
                         <div className="relative mt-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search customers..." 
                                className="pl-8 w-full md:w-1/3"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Company</TableHead>
                            <TableHead className="hidden md:table-cell">
                            Email
                            </TableHead>
                            <TableHead>
                            <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredCustomers.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={customer.avatar} alt="Avatar" data-ai-hint="person avatar" />
                                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>
                                    <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>{customer.status}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{customer.company}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                {customer.email}
                                </TableCell>
                                <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                     {filteredCustomers.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No customers found matching your criteria.</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DashboardLayout>
  );
}
