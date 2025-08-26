
import { NextResponse } from 'next/server';
import { addCustomer as addCustomerData, getCustomers, getCurrentUser } from '@/lib/data';
import { z } from 'zod';

const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
});


export async function GET() {
    const customers = getCustomers();
    return NextResponse.json(customers);
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = customerFormSchema.parse(json);

        // This is the correct place to get the current user.
        const currentUser = getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const newCustomer = addCustomerData({
            name: body.name,
            email: body.email,
            phone: body.phone,
            organization: body.organization,
            ownerId: currentUser.id,
            organizationId: currentUser.organizationId
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
