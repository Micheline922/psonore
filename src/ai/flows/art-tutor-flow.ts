'use server';

/**
 * @fileOverview An AI flow for a virtual art tutor.
 *
 * - artTutor - A function that handles the chat interaction with the tutor.
 * - ArtTutorInput - The input type for the artTutor function.
 * - ArtTutorOutput - The return type for the artTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArtTutorInputSchema = z.object({
  artistName: z.string().describe("The user's artist name."),
  userMessage: z.string().describe('The question or message from the user.'),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).describe('The conversation history.'),
});
export type ArtTutorInput = z.infer<typeof ArtTutorInputSchema>;

const ArtTutorOutputSchema = z.object({
  tutorResponse: z
    .string()
    .describe('The AI-generated response from the art tutor.'),
});
export type ArtTutorOutput = z.infer<typeof ArtTutorOutputSchema>;

export async function artTutor(
  input: ArtTutorInput
): Promise<ArtTutorOutput> {
  return artTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'artTutorPrompt',
  input: {schema: ArtTutorInputSchema},
  output: {schema: ArtTutorOutputSchema},
  prompt: `You are "Maestro Plume", an AI tutor in the "Plume Sonore" app's academy. You are speaking with an artist named {{{artistName}}}.

Your personality is wise, patient, and encouraging. You are an expert in all forms of creative writing, including poetry, slam, rap, storytelling, etc. Your goal is to answer the user's questions clearly and help them deepen their artistic knowledge. Provide concrete examples and suggest exercises when relevant.

The conversation history is:
{{#each history}}
**{{role}}**: {{content}}
{{/each}}

User's latest message:
{{{userMessage}}}

Your response (as Maestro Plume):`,
});

const artTutorFlow = ai.defineFlow(
  {
    name: 'artTutorFlow',
    inputSchema: ArtTutorInputSchema,
    outputSchema: ArtTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
