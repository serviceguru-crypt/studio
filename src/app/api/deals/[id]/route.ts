
import { NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/data';
import { z } from "zod";

const dealFormSchema = z.object({
  name: z.string().min(3).optional(),
  customerId: z.string().optional(),
  value: z.coerce.number().min(0).optional(),
  stage: z.enum(["Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]).optional(),
  closeDate: z.date().optional(),
  leadScore: z.enum(['Hot', 'Warm', 'Cold']).optional().nullable(),
  justification: z.string().optional().nullable(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const deal = getDealById(params.id);
    if (!deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    return NextResponse.json(deal);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const json = await request.json();
        // Zod needs to parse the date string into a Date object
        if (json.closeDate) {
            json.closeDate = new Date(json.closeDate);
        }
        const body = dealFormSchema.parse(json);

        const updatedDeal = updateDeal(params.id, body);
        if (!updatedDeal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }
        return NextResponse.json(updatedDeal);

    } catch (error) {
         if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to update deal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        deleteDeal(params.id);
        return new NextResponse(null, { status: 204 });
    } catch(error) {
        console.error('Failed to delete deal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
