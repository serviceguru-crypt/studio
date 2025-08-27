
'use server';

/**
 * @fileOverview An AI agent for analyzing the historical journey of a sales deal.
 * 
 * - analyzeDealJourney - A function that analyzes the activity feed of a deal to provide insights.
 * - AnalyzeDealJourneyInput - The input type for the analyzeDealJourney function.
 * - AnalyzeDealJourneyOutput - The return type for the analyzeDealJourney function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeDealJourneyInputSchema = z.object({
  dealName: z.string().describe('The name of the deal being analyzed.'),
  dealValue: z.number().describe('The final or current monetary value of the deal.'),
  finalStage: z.string().describe('The final or current stage of the deal (e.g., Closed Won, Negotiation).'),
  activityHistory: z.string().describe('A newline-separated string of all activities and updates logged for the deal, in chronological order.'),
});
export type AnalyzeDealJourneyInput = z.infer<typeof AnalyzeDealJourneyInputSchema>;

const AnalyzeDealJourneyOutputSchema = z.object({
  analysis: z.string().describe('A concise analysis of the deal journey, highlighting key events, duration in stages, and providing actionable takeaways.'),
});
export type AnalyzeDealJourneyOutput = z.infer<typeof AnalyzeDealJourneyOutputSchema>;

export async function analyzeDealJourney(input: AnalyzeDealJourneyInput): Promise<AnalyzeDealJourneyOutput> {
  return analyzeDealJourneyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDealJourneyPrompt',
  input: { schema: AnalyzeDealJourneyInputSchema },
  output: { schema: AnalyzeDealJourneyOutputSchema },
  prompt: `You are an expert sales analyst. Your task is to analyze the history of a sales deal to provide key takeaways for the sales team.

  Analyze the provided deal information and its full activity history.
  
  Your analysis should be concise (3-4 sentences) and focus on:
  1.  **Key Events**: What were the pivotal moments? (e.g., "The deal accelerated after the successful demo on [date].")
  2.  **Sticking Points**: Where did the deal slow down? (e.g., "Negotiations stalled for 2 weeks, which could be a point for process improvement.")
  3.  **Actionable Takeaways**: What can be learned from this deal to improve future sales? (e.g., "Takeaway: Engaging the technical lead early was crucial for success.")

  **Deal Information:**
  - Name: {{dealName}}
  - Value: ₦{{dealValue}}
  - Final Stage: {{finalStage}}
  
  **Activity History (Chronological):**
  {{{activityHistory}}}
  
  Generate your analysis.
  `,
});

const analyzeDealJourneyFlow = ai.defineFlow(
  {
    name: 'analyzeDealJourneyFlow',
    inputSchema: AnalyzeDealJourneyInputSchema,
    outputSchema: AnalyzeDealJourneyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
