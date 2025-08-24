
'use server';

/**
 * @fileOverview A lead scoring AI agent.
 * 
 * - scoreLead - A function that handles the lead scoring process.
 * - ScoreLeadInput - The input type for the scoreLead function.
 * - ScoreLeadOutput - The return type for the scoreLead function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ScoreLeadInputSchema = z.object({
  dealName: z.string().describe('The name or title of the deal.'),
  companyName: z.string().describe('The name of the company associated with the deal.'),
  dealValue: z.number().describe('The monetary value of the deal.'),
  stage: z.string().describe('The current stage of the deal in the sales pipeline (e.g., Qualification, Proposal).'),
});
export type ScoreLeadInput = z.infer<typeof ScoreLeadInputSchema>;

export const ScoreLeadOutputSchema = z.object({
  leadScore: z.enum(['Hot', 'Warm', 'Cold']).describe('The calculated score for the lead.'),
  justification: z.string().describe('A brief justification for why the lead was given this score.'),
});
export type ScoreLeadOutput = z.infer<typeof ScoreLeadOutputSchema>;

export async function scoreLead(input: ScoreLeadInput): Promise<ScoreLeadOutput> {
  return scoreLeadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreLeadPrompt',
  input: { schema: ScoreLeadInputSchema },
  output: { schema: ScoreLeadOutputSchema },
  prompt: `You are a sales operations analyst tasked with scoring new leads.

  Analyze the provided deal information to determine if a lead is 'Hot', 'Warm', or 'Cold'.
  
  - **Hot**: High-value deals, or deals in later stages like 'Negotiation'. These are priority.
  - **Warm**: Mid-value deals or deals in early-to-mid stages like 'Proposal' or 'Qualification'. Need nurturing.
  - **Cold**: Low-value deals or deals that are just starting out. Monitor but not a priority.

  Provide a brief justification for your scoring.

  Deal Information:
  - Name: {{{dealName}}}
  - Company: {{{companyName}}}
  - Value: {{{dealValue}}}
  - Stage: {{{stage}}}
  `,
});

const scoreLeadFlow = ai.defineFlow(
  {
    name: 'scoreLeadFlow',
    inputSchema: ScoreLeadInputSchema,
    outputSchema: ScoreLeadOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
