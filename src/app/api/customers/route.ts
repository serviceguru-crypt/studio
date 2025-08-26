
import { NextResponse } from 'next/server';
import { getCustomers, addCustomer as addCustomerData } from '@/lib/data';
import { z } from 'zod';

const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  ownerId: z.string(),
  organizationId: z.string(),
});


export async function GET() {
    // In a real app, you'd add authentication and organization checks here
    const customers = getCustomers();
    return NextResponse.json(customers);
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = customerFormSchema.parse(json);

        const newCustomer = addCustomerData({
            name: body.name,
            email: body.email,
            phone: body.phone,
            organization: body.organization,
            ownerId: body.ownerId,
            organizationId: body.organizationId
        });

        return NextResponse.json(newCustomer, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Zod validation error in /api/customers:', error.issues);
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to create customer in /api/customers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
