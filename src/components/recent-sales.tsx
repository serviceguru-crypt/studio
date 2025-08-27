import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type RecentSalesProps = {
    data: {
        id: string;
        name: string;
        email: string;
        amount: number;
        avatar: string;
    }[];
    totalSales: number;
};

export function RecentSales({ data, totalSales }: RecentSalesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>You made {totalSales} sales in this period.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={sale.avatar} alt="Avatar" data-ai-hint="person avatar" />
                            <AvatarFallback>{sale.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                            <p className="text-sm text-muted-foreground">{sale.email}</p>
                        </div>
                        <div className="font-medium">+₦{sale.amount.toLocaleString()}</div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        No recent sales in this period.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
