
'use server';

/**
 * @fileOverview A lead scoring AI agent.
 * 
 * - scoreLead - A function that handles the lead scoring process.
 */

import { ai } from '@/ai/genkit';
import { ScoreLeadInputSchema, ScoreLeadOutputSchema, ScoreLeadInput, ScoreLeadOutput } from '@/ai/schemas/score-lead-schema';


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
