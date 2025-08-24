
"use client";

import * as React from 'react';
import { addDays, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { MetricCard } from '@/components/metric-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { BarChartCard } from '@/components/charts/bar-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { salesData, revenueData, leadsData, recentSales, teamPerformance, getDeals, Deal } from '@/lib/data';
import { Users, DollarSign, Briefcase, TrendingUp, TrendingDown, CircleHelp, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';


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
export default function AnalyticsPage() {
    const [allDeals, setAllDeals] = React.useState<Deal[]>([]);
    const [filteredDeals, setFilteredDeals] = React.useState<Deal[]>([]);
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: addDays(new Date(), -90),
      to: new Date(),
    });


    React.useEffect(() => {
        const deals = getDeals();
        setAllDeals(deals);
    }, []);

    React.useEffect(() => {
        if (date?.from && date?.to) {
            const filtered = allDeals.filter(deal => 
                isWithinInterval(deal.closeDate, { start: date.from!, end: date.to! })
            );
            setFilteredDeals(filtered);
        } else {
            setFilteredDeals(allDeals);
        }
    }, [date, allDeals]);


    const metrics = {
        totalRevenue: 45231.89,
        subscriptions: 2350,
        sales: 12234,
        activeNow: 573,
        salesData: salesData,
        revenueData: revenueData,
        leadsData: leadsData,
        recentSales: recentSales,
        teamPerformance: teamPerformance
    };
    
    if (allDeals.length === 0) {
        return (
             <DashboardLayout>
                <div className="flex flex-col w-full">
                <Header date={date} onDateChange={setDate}/>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
                     <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <Skeleton className="h-[125px] w-full" />
                        <Skeleton className="h-[125px] w-full" />
                        <Skeleton className="h-[125px] w-full" />
                        <Skeleton className="h-[125px] w-full" />
                    </div>
                     <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                        <Skeleton className="h-[350px] w-full" />
                        <Skeleton className="h-[350px] w-full" />
                    </div>
                </main>
                </div>
            </DashboardLayout>
        )
    }

    const handleExport = () => {
        const dataToExport = filteredDeals.map(({ id, ...rest }) => rest);
        exportToCsv('analytics_deals.csv', dataToExport);
    }

    const totalLeads = metrics.leadsData.reduce((acc, item) => acc + item.count, 0);
    const wonDeals = filteredDeals.filter(d => d.stage === 'Closed Won');
    const lostDeals = filteredDeals.filter(d => d.stage === 'Closed Lost');
    const winRate = (wonDeals.length > 0 || lostDeals.length > 0) ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;
    const avgDealValue = filteredDeals.length > 0 ? filteredDeals.reduce((acc, deal) => acc + deal.value, 0) / filteredDeals.length : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header date={date} onDateChange={setDate} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
            <div className="flex justify-end">
                 <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <MetricCard title="Win Rate" value={`${winRate.toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4" />} description="Ratio of deals won" />
                <MetricCard title="Avg. Deal Value" value={`₦${avgDealValue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} description="Average value of all deals" />
                <MetricCard title="Deals Won" value={`${wonDeals.length}`} icon={<Briefcase className="h-4 w-4" />} description="Total deals closed successfully" />
                <MetricCard title="Deals Lost" value={`${lostDeals.length}`} icon={<TrendingDown className="h-4 w-4" />} description="Total deals lost" />
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                 <LineChartCard data={metrics.salesData} />
                 <PieChartCard data={metrics.leadsData} />
            </div>

             <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Deal Name</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead className="hidden md:table-cell">Company</TableHead>
                                <TableHead className="text-right">Value</TableHead>
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
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {filteredDeals.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No deals found for the selected date range.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 md:gap-8">
                <BarChartCard data={metrics.teamPerformance} />
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Funnel</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Users className="h-6 w-6 text-primary"/>
                                <div>
                                    <p className="font-bold">Total Leads</p>
                                    <p className="text-sm text-muted-foreground">Top of the funnel</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">{totalLeads}</p>
                        </div>
                         <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <CircleHelp className="h-6 w-6 text-yellow-500"/>
                                <div>
                                    <p className="font-bold">Qualified Leads</p>
                                    <p className="text-sm text-muted-foreground">Leads that fit criteria</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">{filteredDeals.filter(d => d.stage === 'Qualification').length}</p>
                        </div>
                         <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-6 w-6 text-orange-500"/>
                                <div>
                                    <p className="font-bold">Proposals Sent</p>
                                    <p className="text-sm text-muted-foreground">Deals in proposal stage</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">{filteredDeals.filter(d => d.stage === 'Proposal').length}</p>
                        </div>
                         <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-green-500"/>
                                <div>
                                    <p className="font-bold">Closed Won</p>
                                    <p className="text-sm text-muted-foreground">Successful deals</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">{wonDeals.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

    