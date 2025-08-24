
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
import { MoreHorizontal, File, PlusCircle, Search } from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDeals, Deal } from '@/lib/data';
import { Input } from '@/components/ui/input';

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

export default function DealsPage() {
  const [allDeals, setAllDeals] = React.useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = React.useState<Deal[]>([]);
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const deals = getDeals();
    setAllDeals(deals);
    setFilteredDeals(deals);
  }, []);

  const filterDeals = React.useCallback((tab: string, term: string) => {
    let deals = [...allDeals];
    
    // Filter by tab
    const formattedTab = tab.toLowerCase().replace(' ', '');
    if (formattedTab !== 'all') {
      deals = deals.filter(deal => deal.stage.toLowerCase().replace(' ', '') === formattedTab);
    }
    
    // Filter by search term
    if (term) {
      deals = deals.filter(deal =>
        deal.name.toLowerCase().includes(term.toLowerCase()) ||
        deal.company.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredDeals(deals);
  }, [allDeals]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterDeals(value, searchTerm);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterDeals(activeTab, term);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="qualification">Qualification</TabsTrigger>
                <TabsTrigger value="proposal">Proposal</TabsTrigger>
                <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
                <TabsTrigger value="closedwon">Closed Won</TabsTrigger>
                <TabsTrigger value="closedlost">Closed Lost</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1" asChild>
                  <Link href="/deals/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                      Add Deal
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value={activeTab}>
                <Card>
                    <CardHeader>
                        <CardTitle>Deals</CardTitle>
                        <CardDescription>
                            Manage your deals and track their progress.
                        </CardDescription>
                         <div className="relative mt-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search deals..." 
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
                            <TableHead>Deal Name</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead className="hidden md:table-cell">Company</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredDeals.map(deal => (
                            <TableRow key={deal.id}>
                                <TableCell className="font-medium">{deal.name}</TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeVariant(deal.stage)}>{deal.stage}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{deal.company}</TableCell>
                                <TableCell className="text-right">
                                    ₦{deal.value.toLocaleString()}
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
                     {filteredDeals.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No deals found.</p>
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
