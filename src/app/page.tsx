
"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { MetricCard } from '@/components/metric-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { AiSummary } from '@/components/ai-summary';
import * as data from '@/lib/data';
import { RecentSales } from '@/components/recent-sales';
import { Users, DollarSign, Briefcase, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, isWithinInterval, format, startOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Deal } from '@/lib/data';

export default function Home() {
  const [metrics, setMetrics] = useState<any>(null);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [salesChartData, setSalesChartData] = useState<{ name: string; sales: number }[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    // Data is fetched on the client-side to avoid SSR issues with localStorage
    const deals = data.getDeals();
    setAllDeals(deals);
    setMetrics({
      totalRevenue: 45231.89, // This could be dynamic later
      subscriptions: 2350,
      sales: 12234,
      activeNow: 573,
      leadsData: data.leadsData,
      recentSales: data.recentSales,
      teamPerformance: data.teamPerformance
    });
  }, []);

  useEffect(() => {
    if (date?.from && date?.to) {
        const filtered = allDeals.filter(deal => 
            deal.closeDate && isWithinInterval(deal.closeDate, { start: date.from!, end: date.to! })
        );
        setFilteredDeals(filtered);

        const wonDeals = filtered.filter(d => d.stage === 'Closed Won');
        const monthlySales = wonDeals.reduce((acc, deal) => {
            const month = format(startOfMonth(deal.closeDate), 'MMM yyyy');
            acc[month] = (acc[month] || 0) + deal.value;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(monthlySales)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        
        setSalesChartData(chartData);

    } else {
        setFilteredDeals(allDeals);
        setSalesChartData([]); // Or calculate based on all deals
    }
  }, [date, allDeals]);
  
  if (!metrics) {
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
            <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
              <Skeleton className="col-span-full lg:col-span-4 h-[350px]" />
              <Skeleton className="col-span-full lg:col-span-3 h-[350px]" />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 md:gap-8">
              <Skeleton className="h-[350px] w-full" />
              <Skeleton className="h-[350px] w-full" />
            </div>
          </main>
        </div>
      </DashboardLayout>
    )
  }

  const totalLeads = metrics.leadsData.reduce((acc: number, item: { count: number; }) => acc + item.count, 0);
  const activeDealsCount = filteredDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;
  const totalRevenue = filteredDeals
    .filter(d => d.stage === 'Closed Won')
    .reduce((acc, d) => acc + d.value, 0);
  const totalSales = filteredDeals
    .filter(d => d.stage === 'Closed Won').length;


  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header date={date} onDateChange={setDate} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} description="Revenue from won deals" />
            <MetricCard title="Sales" value={`+${totalSales.toLocaleString()}`} icon={<ShoppingCart className="h-4 w-4" />} description="Deals won in period" />
            <MetricCard title="New Leads" value={`+${totalLeads.toLocaleString()}`} icon={<Users className="h-4 w-4" />} description="All leads acquired" />
            <MetricCard title="Active Deals" value={`${activeDealsCount}`} icon={<Briefcase className="h-4 w-4" />} description="Deals not yet closed" />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
            <div className="col-span-full lg:col-span-4">
               <LineChartCard data={salesChartData} />
            </div>
            <div className="col-span-full lg:col-span-3">
               <AiSummary metrics={{...metrics, dealsData: filteredDeals}} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 md:gap-8">
              <PieChartCard data={metrics.leadsData} />
              <RecentSales data={metrics.recentSales} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
