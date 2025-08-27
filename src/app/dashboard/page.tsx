
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { MetricCard } from '@/components/metric-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { AiSummary } from '@/components/ai-summary';
import { getDeals, getCustomers, leadsSourceData, Deal, Customer } from '@/lib/data';
import { RecentSales } from '@/components/recent-sales';
import { Users, DollarSign, Briefcase, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, isWithinInterval, format, startOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    // This is a placeholder for proper auth handling
    const loggedInUser = localStorage.getItem('currentUser');
    if (!loggedInUser) {
      router.replace('/login');
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const deals = await getDeals();
    const custs = await getCustomers();
    setAllDeals(deals.map(d => ({ ...d, closeDate: new Date(d.closeDate) })));
    setCustomers(custs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000); 

    // This is a simple way to refetch on window focus, you might want a more robust solution
    window.addEventListener('focus', fetchData);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', fetchData);
    };
  }, [fetchData]);
  
  const filteredDeals = useMemo(() => {
    if (!date?.from || !date?.to) return allDeals;
    return allDeals.filter(deal => 
        deal.closeDate && isWithinInterval(deal.closeDate, { start: date.from!, end: date.to! })
    );
  }, [allDeals, date]);

  const salesChartData = useMemo(() => {
    const wonDeals = filteredDeals.filter(d => d.stage === 'Closed Won');
    const monthlySales = wonDeals.reduce((acc, deal) => {
        const month = format(startOfMonth(deal.closeDate), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + deal.value;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlySales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredDeals]);

  const metrics = useMemo(() => {
    if (isLoading || customers.length === 0) return null;

    const customersById = new Map(customers.map(c => [c.id, c]));
    const totalLeads = Array.isArray(leadsSourceData) ? leadsSourceData.reduce((acc: number, item: { count: number; }) => acc + item.count, 0) : 0;
    const activeDealsCount = allDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;
    
    const wonDealsInPeriod = filteredDeals.filter(d => d.stage === 'Closed Won');
    const totalRevenue = wonDealsInPeriod.reduce((acc, d) => acc + d.value, 0);
    const totalSales = wonDealsInPeriod.length;

    const recentSalesData = wonDealsInPeriod
      .sort((a, b) => b.closeDate.getTime() - a.closeDate.getTime())
      .slice(0, 5)
      .map(deal => {
        const customer = customersById.get(deal.customerId);
        return {
          name: customer?.name || 'Unknown Customer',
          email: customer?.email || '',
          amount: deal.value,
          avatar: customer?.avatar || `https://placehold.co/40x40.png`,
        }
      });

    return {
      totalRevenue,
      totalSales,
      totalLeads,
      activeDealsCount,
      leadsBySource: leadsSourceData,
      dealsData: filteredDeals, // This is correct for AI summary in the selected period
      recentSales: recentSalesData,
    };
  }, [isLoading, allDeals, filteredDeals, customers]);
  
  if (isLoading || !metrics) {
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

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header date={date} onDateChange={setDate} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={`₦${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} description="Revenue from won deals in period" />
            <MetricCard title="Sales" value={`+${metrics.totalSales.toLocaleString()}`} icon={<ShoppingCart className="h-4 w-4" />} description="Deals won in period" />
            <MetricCard title="New Leads" value={`+${metrics.totalLeads.toLocaleString()}`} icon={<Users className="h-4 w-4" />} description="All leads acquired" />
            <MetricCard title="Active Deals" value={`${metrics.activeDealsCount}`} icon={<Briefcase className="h-4 w-4" />} description="All deals not yet closed" />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
            <div className="col-span-full lg:col-span-4">
               <LineChartCard data={salesChartData} />
            </div>
            <div className="col-span-full lg:col-span-3">
               <AiSummary metrics={metrics} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 md:gap-8">
              <PieChartCard data={metrics.leadsBySource} />
              <RecentSales data={metrics.recentSales} totalSales={metrics.totalSales} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
