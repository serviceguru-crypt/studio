import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { MetricCard } from '@/components/metric-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { BarChartCard } from '@/components/charts/bar-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { AiSummary } from '@/components/ai-summary';
import { salesData, revenueData, leadsData, dealsData, recentSales, teamPerformance } from '@/lib/data';
import { RecentSales } from '@/components/recent-sales';
import { Users, DollarSign, Briefcase, ShoppingCart } from 'lucide-react';

export default function Home() {
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

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={`₦${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} description="+20.1% from last month" />
            <MetricCard title="Sales" value={`+${metrics.sales.toLocaleString()}`} icon={<ShoppingCart className="h-4 w-4" />} description="+180.1% from last month" />
            <MetricCard title="New Leads" value={`+${totalLeads.toLocaleString()}`} icon={<Users className="h-4 w-4" />} description="+19% from last month" />
            <MetricCard title="Active Deals" value={`${metrics.dealsData.length}`} icon={<Briefcase className="h-4 w-4" />} description="2 closing this month" />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
            <div className="col-span-full lg:col-span-4">
               <LineChartCard data={metrics.salesData} />
            </div>
            <div className="col-span-full lg:col-span-3">
               <AiSummary metrics={metrics} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              <PieChartCard data={metrics.leadsData} />
              <BarChartCard data={metrics.teamPerformance} />
              <RecentSales data={metrics.recentSales} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
