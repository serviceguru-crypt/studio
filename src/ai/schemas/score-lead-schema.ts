/**
 * @fileOverview Defines the data schemas for the lead scoring AI agent.
 * 
 * - ScoreLeadInputSchema - The Zod schema for the input of the scoreLead function.
 * - ScoreLeadInput - The TypeScript type for the input of the scoreLead function.
 * - ScoreLeadOutputSchema - The Zod schema for the output of the scoreLead function.
 * - ScoreLeadOutput - The TypeScript type for the output of the scoreLead function.
 */

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
