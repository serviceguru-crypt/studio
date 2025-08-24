
"use client";

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getDeals, Deal } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
};

export default function CalendarPage() {
    const [deals, setDeals] = React.useState<Deal[]>([]);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

    React.useEffect(() => {
        const allDeals = getDeals();
        setDeals(allDeals);
    }, []);
    
    const dealsForSelectedDate = selectedDate 
        ? deals.filter(deal => 
            deal.closeDate.getFullYear() === selectedDate.getFullYear() &&
            deal.closeDate.getMonth() === selectedDate.getMonth() &&
            deal.closeDate.getDate() === selectedDate.getDate()
        )
        : [];

    const DayContent = (props: { date: Date }) => {
        const dealsOnDay = deals.filter(deal => 
            deal.closeDate.getFullYear() === props.date.getFullYear() &&
            deal.closeDate.getMonth() === props.date.getMonth() &&
            deal.closeDate.getDate() === props.date.getDate()
        );
        
        return (
            <div className="relative h-full w-full">
                <span>{props.date.getDate()}</span>
                {dealsOnDay.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
                        {dealsOnDay.slice(0, 2).map(d => (
                             <div key={d.id} className={`h-1.5 w-1.5 rounded-full ${d.stage === 'Closed Won' ? 'bg-green-500' : d.stage === 'Closed Lost' ? 'bg-red-500' : 'bg-primary'}`}></div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col w-full">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <div className="grid gap-4 md:grid-cols-3 md:gap-8">
                        <div className="md:col-span-2">
                             <Card>
                                <CardContent className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="p-0"
                                        classNames={{
                                            root: "w-full",
                                            months: "flex flex-col sm:flex-row",
                                            month: "w-full space-y-4",
                                            caption: "flex justify-center pt-4 relative items-center",
                                            table: "w-full border-collapse space-y-1",
                                            head_row: "flex",
                                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                            row: "flex w-full mt-2",
                                            cell: "h-20 w-full text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                            day: "h-full w-full p-0 font-normal aria-selected:opacity-100",
                                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        }}
                                        components={{
                                          DayContent: DayContent
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Deals for {selectedDate ? selectedDate.toLocaleDateString() : 'Today'}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {dealsForSelectedDate.length > 0 ? (
                                        dealsForSelectedDate.map(deal => (
                                            <Link href={`/deals/${deal.id}`} key={deal.id}>
                                                <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer border">
                                                    <div className="font-semibold">{deal.name}</div>
                                                    <div className="text-sm text-muted-foreground">{deal.company}</div>
                                                    <div className="flex items-center justify-between mt-2">
                                                         <Badge variant={getBadgeVariant(deal.stage)}>{deal.stage}</Badge>
                                                         <div className="text-sm font-bold">₦{deal.value.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                     ) : (
                                        <p className="text-muted-foreground">No deals scheduled for this day.</p>
                                     )}
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    )
}
