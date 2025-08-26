
import { NextResponse } from 'next/server';
import { getDeals, addDeal as addDealData } from '@/lib/data';
import { z } from 'zod';

const dealFormSchema = z.object({
  name: z.string().min(3, { message: "Deal name must be at least 3 characters." }),
  customerId: z.string({ required_error: "Please select a customer." }),
  value: z.coerce.number().min(0, { message: "Value must be a positive number." }),
  stage: z.enum(["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]),
  closeDate: z.date({ required_error: "A close date is required." }),
});

export async function GET() {
    const deals = getDeals();
    return NextResponse.json(deals);
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        // Zod needs to parse the date string into a Date object
        if (json.closeDate) {
            json.closeDate = new Date(json.closeDate);
        }
        const body = dealFormSchema.parse(json);

        const newDeal = addDealData({
            name: body.name,
            customerId: body.customerId,
            value: body.value,
            stage: body.stage,
            closeDate: body.closeDate,
        });

        return NextResponse.json(newDeal, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to create deal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
