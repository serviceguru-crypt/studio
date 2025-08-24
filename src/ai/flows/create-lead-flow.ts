
'use server';

/**
 * @fileOverview An API endpoint for creating a new lead, which translates to a new customer.
 * 
 * - createLead - A function that handles creating a new customer from lead data.
 * - CreateLeadInput - The input type for the createLead function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addCustomer, Customer } from '@/lib/data';

const CreateLeadInputSchema = z.object({
  name: z.string().describe("The full name of the lead."),
  email: z.string().email().describe("The email address of the lead."),
  company: z.string().describe("The company the lead works for."),
  phone: z.string().optional().describe("The phone number of the lead."),
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

// The output will be the newly created customer object
const CreateLeadOutputSchema = z.custom<Customer>();
export type CreateLeadOutput = z.infer<typeof CreateLeadOutputSchema>;


export async function createLead(input: CreateLeadInput): Promise<CreateLeadOutput> {
  return createLeadFlow(input);
}

const createLeadFlow = ai.defineFlow(
  {
    name: 'createLeadFlow',
    inputSchema: CreateLeadInputSchema,
    outputSchema: CreateLeadOutputSchema,
  },
  async (input) => {
    console.log(`Creating lead for ${input.name} from ${input.company}`);
    
    // Use the existing function to add a customer
    const newCustomer = addCustomer({
      name: input.name,
      email: input.email,
      company: input.company,
      phone: input.phone,
    });
    
    console.log(`Successfully created customer with ID: ${newCustomer.id}`);
    
    return newCustomer;
  }
);
