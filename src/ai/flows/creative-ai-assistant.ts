'use server';

/**
 * @fileOverview An AI creative assistant to help poets generate verses, metaphors, and complete unfinished text.
 *
 * - generateCreativeText - A function that handles the text generation process.
 * - GenerateCreativeTextInput - The input type for the generateCreativeText function.
 * - GenerateCreativeTextOutput - The return type for the generateCreativeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCreativeTextInputSchema = z.object({
  textFragment: z
    .string()
    .describe(
      'A fragment of text, potentially incomplete, that the AI will use as a starting point for generating new verses, metaphors, or completing the text.'
    ),
  style: z
    .string()
    .describe(
      'The desired style of the generated text (e.g., slam, rap, romantic poetry, social commentary).'
    ),
});
export type GenerateCreativeTextInput = z.infer<typeof GenerateCreativeTextInputSchema>;

const GenerateCreativeTextOutputSchema = z.object({
  generatedText: z
    .string()
    .describe('The AI-generated text, including verses, metaphors, or completed text.'),
});
export type GenerateCreativeTextOutput = z.infer<typeof GenerateCreativeTextOutputSchema>;

export async function generateCreativeText(
  input: GenerateCreativeTextInput
): Promise<GenerateCreativeTextOutput> {
  return generateCreativeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCreativeTextPrompt',
  input: {schema: GenerateCreativeTextInputSchema},
  output: {schema: GenerateCreativeTextOutputSchema},
  prompt: `You are a creative AI assistant designed to help poets, slammers, rappers, and writers overcome writer's block and enhance their creative process.

You will receive a fragment of text and a desired style. Your task is to generate new verses, metaphors, or complete the text in the specified style.

Text Fragment: {{{textFragment}}}
Desired Style: {{{style}}}

Generated Text:`, // Ensure the output is structured and coherent.
});

const generateCreativeTextFlow = ai.defineFlow(
  {
    name: 'generateCreativeTextFlow',
    inputSchema: GenerateCreativeTextInputSchema,
    outputSchema: GenerateCreativeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

