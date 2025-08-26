'use server';

/**
 * @fileOverview An AI flow for a creative dictionary.
 *
 * - getDefinition - Gets definition, synonyms, and antonyms for a word.
 * - DictionaryInput - The input type for the function.
 * - DictionaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DictionaryInputSchema = z.object({
  word: z.string().describe('The French word to look up.'),
});
export type DictionaryInput = z.infer<typeof DictionaryInputSchema>;

const DictionaryOutputSchema = z.object({
  definition: z.string().describe('The definition of the word.'),
  synonyms: z.array(z.string()).describe('A list of synonyms for the word.'),
  antonyms: z.array(z.string()).describe('A list of antonyms for the word.'),
});
export type DictionaryOutput = z.infer<typeof DictionaryOutputSchema>;

export async function getDefinition(
  input: DictionaryInput
): Promise<DictionaryOutput> {
  return dictionaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dictionaryPrompt',
  input: {schema: DictionaryInputSchema},
  output: {schema: DictionaryOutputSchema},
  prompt: `You are a helpful French dictionary assistant. The user wants to know more about a word.
Provide a clear and concise definition for the word "{{word}}".
Also, provide a list of relevant synonyms and antonyms.
If the word does not exist or is nonsensical, return empty strings and arrays.`,
});

const dictionaryFlow = ai.defineFlow(
  {
    name: 'dictionaryFlow',
    inputSchema: DictionaryInputSchema,
    outputSchema: DictionaryOutputSchema,
  },
  async input => {
    if (!input.word) {
      return {
        definition: '',
        synonyms: [],
        antonyms: [],
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
