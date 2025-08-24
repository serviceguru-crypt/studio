// Summarize key insights from dashboard data.

'use server';

/**
 * @fileOverview Summarizes key insights from dashboard data.
 *
 * - summarizeDashboardInsights - A function that summarizes insights from dashboard data.
 * - SummarizeDashboardInsightsInput - The input type for the summarizeDashboardInsights function.
 * - SummarizeDashboardInsightsOutput - The return type for the summarizeDashboardInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDashboardInsightsInputSchema = z.object({
  metricsData: z
    .string()
    .describe('JSON string of the dashboard metrics and data to summarize.'),
});
export type SummarizeDashboardInsightsInput = z.infer<
  typeof SummarizeDashboardInsightsInputSchema
>;

const SummarizeDashboardInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key insights.'),
});
export type SummarizeDashboardInsightsOutput = z.infer<
  typeof SummarizeDashboardInsightsOutputSchema
>;

export async function summarizeDashboardInsights(
  input: SummarizeDashboardInsightsInput
): Promise<SummarizeDashboardInsightsOutput> {
  return summarizeDashboardInsightsFlow(input);
}

const summarizeDashboardInsightsPrompt = ai.definePrompt({
  name: 'summarizeDashboardInsightsPrompt',
  input: {schema: SummarizeDashboardInsightsInputSchema},
  output: {schema: SummarizeDashboardInsightsOutputSchema},
  prompt: `You are an expert business analyst reviewing a CRM dashboard.

  Your goal is to summarize the key insights from the data provided. All monetary values are in Nigerian Naira (NGN), so use the '₦' symbol for currency. Focus on the most important trends and information that a user should notice.  If there are no significant trends, state there are no significant trends.

  Data: {{{metricsData}}}`,
});

const summarizeDashboardInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeDashboardInsightsFlow',
    inputSchema: SummarizeDashboardInsightsInputSchema,
    outputSchema: SummarizeDashboardInsightsOutputSchema,
  },
  async input => {
    const {output} = await summarizeDashboardInsightsPrompt(input);
    return output!;
  }
);
