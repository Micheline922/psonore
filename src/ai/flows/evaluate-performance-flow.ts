
'use server';

/**
 * @fileOverview An AI flow for evaluating a user's spoken performance of a text.
 *
 * - evaluatePerformance - Evaluates a user's recitation.
 * - EvaluatePerformanceInput - The input type for the function.
 * - EvaluatePerformanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const EvaluatePerformanceInputSchema = z.object({
  originalText: z.string().describe('The original text the user was supposed to recite.'),
  userRecitation: z.string().describe("The user's spoken performance, transcribed to text."),
});
export type EvaluatePerformanceInput = z.infer<typeof EvaluatePerformanceInputSchema>;

export const EvaluatePerformanceOutputSchema = z.object({
  score: z.number().min(0).max(10).describe('The overall score for the performance, from 0 to 10.'),
  positives: z.string().describe('Specific feedback on what was good about the performance.'),
  improvements: z.string().describe('Constructive suggestions for how to improve the performance.'),
});
export type EvaluatePerformanceOutput = z.infer<typeof EvaluatePerformanceOutputSchema>;

/**
 * Evaluates a user's submitted performance.
 */
export async function evaluatePerformance(input: EvaluatePerformanceInput): Promise<EvaluatePerformanceOutput> {
  return evaluatePerformanceFlow(input);
}


const evaluationPrompt = ai.definePrompt({
    name: 'performanceEvaluator',
    input: { schema: EvaluatePerformanceInputSchema },
    output: { schema: EvaluatePerformanceOutputSchema },
    prompt: `You are an AI vocal coach named "Coach Echo". A user has recorded themselves reciting a text they wrote. Your task is to provide constructive feedback on their performance.

    You must evaluate the performance based on the following criteria:
    - **Clarity and Diction**: How clearly was the text articulated?
    - **Rhythm and Flow**: Was the pacing effective? Were the pauses well-used? Did it have a good cadence?
    - **Emotional Impact**: Did the performance convey the emotion of the text?
    - **Fidelity to the Text**: How well did the recitation match the original text? (Minor deviations are acceptable if they serve the performance).

    **The original text was:**
    ---
    {{{originalText}}}
    ---

    **The user's transcribed recitation was:**
    ---
    {{{userRecitation}}}
    ---

    Your evaluation must be encouraging and helpful. Address the user in the "tu" form.

    1.  **Score**: Give a global score from 0 to 10, synthesizing all evaluation criteria.
    2.  **Positives**: Write a short paragraph highlighting 1-2 specific things the user did well. Be positive and encouraging.
    3.  **Improvements**: Write a short paragraph with 1-2 concrete suggestions for improvement. Focus on actionable advice.

    Generate the score and feedback now.`,
});


const evaluatePerformanceFlow = ai.defineFlow(
  {
    name: 'evaluatePerformanceFlow',
    inputSchema: EvaluatePerformanceInputSchema,
    outputSchema: EvaluatePerformanceOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);
