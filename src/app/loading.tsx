
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <Header />
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
  );
}
