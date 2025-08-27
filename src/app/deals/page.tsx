
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
import { MoreHorizontal, File, PlusCircle, Search, Info, Briefcase, BarChart, FileText, CheckCircle, XCircle } from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Deal, Customer, getDeals as getDealsFromDb, getCustomers, deleteDeal as deleteDealFromDb, updateDeal, User } from '@/lib/data';
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

const StageSummaryCard = ({ title, count, value, icon }: { title: string, count: number, value: number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">Total value: ₦{value.toLocaleString()}</p>
        </CardContent>
    </Card>
)

export default function DealsPage() {
  const [allDeals, setAllDeals] = React.useState<DealWithScore[]>([]);
  const [filteredDeals, setFilteredDeals] = React.useState<DealWithScore[]>([]);
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dealToDelete, setDealToDelete] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

   React.useEffect(() => {
    // This is a placeholder for auth context.
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
    }
  }, []);

  const fetchDeals = React.useCallback(async () => {
    setIsLoading(true);
    try {
        let dealsFromApi: DealWithScore[] = await getDealsFromDb();
        
        dealsFromApi = dealsFromApi.map(deal => ({
            ...deal,
            closeDate: new Date(deal.closeDate) 
        }));

        const customers: Customer[] = await getCustomers();
        const customersById = new Map(customers.map(c => [c.id, c]));

        const dealsWithOrganization = dealsFromApi.map(deal => ({
            ...deal,
            organization: customersById.get(deal.customerId)?.organization || 'N/A'
        }));

        const dealsToScore = dealsWithOrganization.filter(d => !d.leadScore);
        
        setAllDeals(dealsWithOrganization.map(d => ({ ...d, isScoring: !d.leadScore })));

        dealsToScore.forEach(deal => {
          scoreDealAndUpdateState(deal);
        });

    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not fetch deals.",
        });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  const scoreDealAndUpdateState = async (dealToScore: DealWithScore) => {
    if (!dealToScore.organization) return;
    try {
        const result: ScoreLeadOutput = await scoreLead({
            dealName: dealToScore.name,
            organizationName: dealToScore.organization,
            dealValue: dealToScore.value,
            stage: dealToScore.stage,
        });

        await updateDeal(dealToScore.id, { leadScore: result.leadScore, justification: result.justification });
        
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

  const handleDelete = async () => {
    if (dealToDelete) {
        try {
            await deleteDealFromDb(dealToDelete);
            toast({
                title: "Deal Deleted",
                description: "The deal has been successfully deleted.",
            });
            fetchDeals(); // Re-fetch deals to update the list
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not delete the deal. Please try again.",
            });
        } finally {
            setDealToDelete(null);
        }
    }
  };
  
  const stageSummary = React.useMemo(() => {
    const summary = {
        qualification: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        closedWon: { count: 0, value: 0 },
        closedLost: { count: 0, value: 0 },
    };
    allDeals.forEach(deal => {
        switch(deal.stage) {
            case 'Qualification': 
                summary.qualification.count++;
                summary.qualification.value += deal.value;
                break;
            case 'Proposal': 
                summary.proposal.count++;
                summary.proposal.value += deal.value;
                break;
            case 'Negotiation':
                summary.negotiation.count++;
                summary.negotiation.value += deal.value;
                break;
            case 'Closed Won':
                summary.closedWon.count++;
                summary.closedWon.value += deal.value;
                break;
            case 'Closed Lost':
                summary.closedLost.count++;
                summary.closedLost.value += deal.value;
                break;
        }
    });
    return summary;
  }, [allDeals]);

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <TooltipProvider>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Deals</h1>
                    <p className="text-muted-foreground">Manage your deals, track their progress, and use AI to score your leads.</p>
                </div>
                 <div className="flex items-center gap-2">
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
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
                <StageSummaryCard title="Qualification" count={stageSummary.qualification.count} value={stageSummary.qualification.value} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
                <StageSummaryCard title="Proposal" count={stageSummary.proposal.count} value={stageSummary.proposal.value} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
                <StageSummaryCard title="Negotiation" count={stageSummary.negotiation.count} value={stageSummary.negotiation.value} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                <StageSummaryCard title="Closed Won" count={stageSummary.closedWon.count} value={stageSummary.closedWon.value} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
                <StageSummaryCard title="Closed Lost" count={stageSummary.closedLost.count} value={stageSummary.closedLost.value} icon={<XCircle className="h-4 w-4 text-muted-foreground" />} />
            </div>

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
                </div>
                <TabsContent value={activeTab}>
                    <Card>
                        <CardHeader>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search deals by name or organization..." 
                                    className="pl-8 w-full md:w-1/3"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                        {isLoading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deal Name</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead className="hidden sm:table-cell">Lead Score</TableHead>
                                        <TableHead className="hidden md:table-cell">Organization</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
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
                                            <Link href={`/deals/${deal.id}/edit`}>Update Deal</Link>
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
                        )}
                        {filteredDeals.length === 0 && !isLoading && (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No deals found matching your criteria.</p>
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
