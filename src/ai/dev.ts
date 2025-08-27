import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-dashboard-insights.ts';
import '@/ai/flows/score-lead-flow.ts';
import '@/ai/flows/generate-email-flow.ts';
import '@/ai/flows/analyze-deal-journey-flow.ts';

