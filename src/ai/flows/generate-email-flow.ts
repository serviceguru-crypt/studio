
'use server';

/**
 * @fileOverview An AI agent for generating professional emails.
 * 
 * - generateEmail - A function that handles the email generation process.
 * - GenerateEmailInput - The input type for the generateEmail function.
 * - GenerateEmailOutput - The return type for the generateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEmailInputSchema = z.object({
  customerName: z.string().describe('The name of the customer the email is being sent to.'),
  companyName: z.string().describe('The company of the customer.'),
  emailTone: z.enum(['Formal', 'Friendly', 'Follow-up']).describe('The desired tone of the email.'),
  emailContent: z.string().describe('The key points or content to include in the email body.'),
});
export type GenerateEmailInput = z.infer<typeof GenerateEmailInputSchema>;

const GenerateEmailOutputSchema = z.object({
  subject: z.string().describe('The generated subject line for the email.'),
  body: z.string().describe('The generated body of the email.'),
});
export type GenerateEmailOutput = z.infer<typeof GenerateEmailOutputSchema>;

export async function generateEmail(input: GenerateEmailInput): Promise<GenerateEmailOutput> {
  return generateEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailPrompt',
  input: { schema: GenerateEmailInputSchema },
  output: { schema: GenerateEmailOutputSchema },
  prompt: `You are a professional sales assistant. Your task is to compose a high-quality email.

  The email should be addressed to {{customerName}} from {{companyName}}.
  The tone of the email must be {{emailTone}}.
  The content of the email should be based on these key points: {{{emailContent}}}.
  
  Generate a suitable subject line and a complete email body. Ensure the email is well-written, professional, and ready to be sent.
  `,
});

const generateEmailFlow = ai.defineFlow(
  {
    name: 'generateEmailFlow',
    inputSchema: GenerateEmailInputSchema,
    outputSchema: GenerateEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
