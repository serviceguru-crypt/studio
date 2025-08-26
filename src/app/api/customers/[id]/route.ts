
import { NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, deleteCustomer } from '@/lib/data';
import { z } from "zod";

const customerFormSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().min(2).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
    const customer = getCustomerById(params.id);
    if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const json = await request.json();
        const body = customerFormSchema.parse(json);

        const updatedCustomer = updateCustomer(params.id, body);
        if (!updatedCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json(updatedCustomer);

    } catch (error) {
         if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to update customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        deleteCustomer(params.id);
        return new NextResponse(null, { status: 204 });
    } catch(error) {
        console.error('Failed to delete customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
