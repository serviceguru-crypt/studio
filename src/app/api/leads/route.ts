
import { NextResponse } from 'next/server';
import { addLead as addLeadData, getLeads } from '@/lib/data';
import { z } from 'zod';

const leadFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  phone: z.string().optional(),
  ownerId: z.string(),
  organizationId: z.string(),
});

export async function GET() {
    const leads = getLeads();
    return NextResponse.json(leads);
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = leadFormSchema.parse(json);

        const newLead = addLeadData({
            name: body.name,
            email: body.email,
            phone: body.phone,
            organization: body.organization,
            ownerId: body.ownerId,
            organizationId: body.organizationId,
        });

        return NextResponse.json(newLead, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to create lead:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
