
"use client";

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { MetricCard } from '@/components/metric-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { BarChartCard } from '@/components/charts/bar-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { AiSummary } from '@/components/ai-summary';
import { salesData, revenueData, leadsData, dealsData, recentSales, teamPerformance } from '@/lib/data';
import { Users, DollarSign, Briefcase, TrendingUp, TrendingDown, CircleHelp } from 'lucide-react';
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
    const metrics = {
        totalRevenue: 45231.89,
        subscriptions: 2350,
        sales: 12234,
        activeNow: 573,
        salesData: salesData,
        revenueData: revenueData,
        leadsData: leadsData,
        dealsData: dealsData,
        recentSales: recentSales,
        teamPerformance: teamPerformance
    };
    
    const totalLeads = metrics.leadsData.reduce((acc, item) => acc + item.count, 0);
    const wonDeals = dealsData.filter(d => d.stage === 'Closed Won');
    const lostDeals = dealsData.filter(d => d.stage === 'Closed Lost');
    const winRate = wonDeals.length / (wonDeals.length + lostDeals.length) * 100;
    const avgDealValue = dealsData.reduce((acc, deal) => acc + deal.value, 0) / dealsData.length;

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
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
                                {dealsData.map(deal => (
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
                            <p className="text-xl font-bold">{dealsData.filter(d => d.stage === 'Qualification').length}</p>
                        </div>
                         <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-6 w-6 text-orange-500"/>
                                <div>
                                    <p className="font-bold">Proposals Sent</p>
                                    <p className="text-sm text-muted-foreground">Deals in proposal stage</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">{dealsData.filter(d => d.stage === 'Proposal').length}</p>
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
