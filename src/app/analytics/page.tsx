import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p>This is the analytics page. Content coming soon.</p>
        </main>
      </div>
    </DashboardLayout>
  );
}
