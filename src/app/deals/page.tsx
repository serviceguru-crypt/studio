
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, File, PlusCircle, Search, Info } from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDeals, deleteDeal, Deal, updateDeal, getCustomers, Customer, users, User } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { exportToCsv } from '@/lib/utils';
import { scoreLead } from '@/ai/flows/score-lead-flow';
import type { ScoreLeadOutput } from '@/ai/schemas/score-lead-schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

type DealWithScore = Deal & { 
    isScoring?: boolean;
    organization?: string;
};


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

const getScoreBadgeVariant = (score?: string) => {
    switch (score) {
        case 'Hot':
            return 'destructive';
        case 'Warm':
            return 'secondary';
        case 'Cold':
            return 'outline';
        default:
            return 'outline';
    }
}

export default function DealsPage() {
  const [allDeals, setAllDeals] = React.useState<DealWithScore[]>([]);
  const [filteredDeals, setFilteredDeals] = React.useState<DealWithScore[]>([]);
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dealToDelete, setDealToDelete] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const { toast } = useToast();

   React.useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
    }
  }, []);

  const fetchDeals = React.useCallback(() => {
    const dealsFromDb = getDeals();
    const customers = getCustomers();
    const customersById = new Map(customers.map(c => [c.id, c]));

    const dealsWithOrganization = dealsFromDb.map(deal => ({
        ...deal,
        organization: customersById.get(deal.customerId)?.organization || 'N/A'
    }));

    const dealsToScore = dealsWithOrganization.filter(d => !d.leadScore);
    
    setAllDeals(dealsWithOrganization.map(d => ({ ...d, isScoring: !d.leadScore })));

    dealsToScore.forEach(deal => {
      scoreDealAndupdateState(deal);
    });
  }, []);

  const scoreDealAndupdateState = async (dealToScore: DealWithScore) => {
    if (!dealToScore.organization) return;
    try {
        const result: ScoreLeadOutput = await scoreLead({
            dealName: dealToScore.name,
            organizationName: dealToScore.organization,
            dealValue: dealToScore.value,
            stage: dealToScore.stage,
        });

        updateDeal(dealToScore.id, { leadScore: result.leadScore, justification: result.justification });
        
        setAllDeals(prevDeals => 
            prevDeals.map(d => 
                d.id === dealToScore.id 
                ? { ...d, leadScore: result.leadScore, justification: result.justification, isScoring: false } 
                : d
            )
        );

    } catch (error) {
        console.error("Failed to score lead:", error);
         setAllDeals(prevDeals => prevDeals.map(d => d.id === dealToScore.id ? { ...d, isScoring: false } : d));
    }
  }

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const filterDeals = React.useCallback((tab: string, term: string) => {
    let deals = [...allDeals];
    
    const formattedTab = tab.toLowerCase().replace(/ /g, '');
    if (formattedTab !== 'all') {
      deals = deals.filter(deal => deal.stage.toLowerCase().replace(/ /g, '') === formattedTab);
    }
    
    if (term) {
      deals = deals.filter(deal =>
        deal.name.toLowerCase().includes(term.toLowerCase()) ||
        deal.organization?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredDeals(deals);
  }, [allDeals]);


  React.useEffect(() => {
    filterDeals(activeTab, searchTerm);
  }, [allDeals, activeTab, searchTerm, filterDeals]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleExport = () => {
    const dataToExport = filteredDeals.map(({ id, isScoring, customerId, ...rest }) => rest);
    exportToCsv('deals.csv', dataToExport);
  }

  const handleDelete = () => {
    if (dealToDelete) {
        deleteDeal(dealToDelete);
        toast({
            title: "Deal Deleted",
            description: "The deal has been successfully deleted.",
        });
        setDealToDelete(null);
        fetchDeals(); // Re-fetch deals to update the list
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <TooltipProvider>
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
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
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
                            Manage your deals, track their progress, and use AI to score your leads.
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
                             <TableHead className="hidden sm:table-cell">Lead Score</TableHead>
                            <TableHead className="hidden md:table-cell">Organization</TableHead>
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
                                <TableCell className="hidden sm:table-cell">
                                    {deal.isScoring ? (
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                    ) : deal.leadScore ? (
                                        <div className="flex items-center gap-1">
                                            <Badge variant={getScoreBadgeVariant(deal.leadScore)}>{deal.leadScore}</Badge>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{deal.justification}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    ) : (
                                       <Badge variant="outline">Not Scored</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{deal.organization}</TableCell>
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
                                    <DropdownMenuItem asChild>
                                        <Link href={`/deals/${deal.id}/edit`}>Edit</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/deals/${deal.id}`}>View Details</Link>
                                    </DropdownMenuItem>
                                    {currentUser?.role === 'Admin' && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => setDealToDelete(deal.id)}>Delete</DropdownMenuItem>
                                        </>
                                    )}
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
          </TooltipProvider>

          <AlertDialog open={!!dealToDelete} onOpenChange={(open) => !open && setDealToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the deal.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDealToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </main>
      </div>
    </DashboardLayout>
  );
}
