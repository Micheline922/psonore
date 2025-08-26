'use server';

/**
 * @fileOverview An AI flow for a virtual poet community chat.
 *
 * - communityChat - A function that handles the chat interaction.
 * - CommunityChatInput - The input type for the communityChat function.
 * - CommunityChatOutput - The return type for the communityChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunityChatInputSchema = z.object({
  artistName: z.string().describe("The user's artist name."),
  userMessage: z.string().describe('The message sent by the user.'),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).describe('The conversation history.'),
});
export type CommunityChatInput = z.infer<typeof CommunityChatInputSchema>;

const CommunityChatOutputSchema = z.object({
  chatResponse: z
    .string()
    .describe('The AI-generated response from a virtual poet.'),
});
export type CommunityChatOutput = z.infer<typeof CommunityChatOutputSchema>;

export async function communityChat(
  input: CommunityChatInput
): Promise<CommunityChatOutput> {
  return communityChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'communityChatPrompt',
  input: {schema: CommunityChatInputSchema},
  output: {schema: CommunityChatOutputSchema},
  prompt: `You are a virtual poet in "Plume Sonore", a creative writing app. Your name is "Alex le Virtuose". You are talking to another artist named {{{artistName}}}.

Your personality is encouraging, creative, and slightly philosophical. You speak like a modern poet or a wise slammer. You should respond to the user's message, keeping the conversation flowing and inspiring creativity.

The conversation history is:
{{#each history}}
**{{role}}**: {{content}}
{{/each}}

User's latest message:
{{{userMessage}}}

Your response (as Alex le Virtuose):`,
});

const communityChatFlow = ai.defineFlow(
  {
    name: 'communityChatFlow',
    inputSchema: CommunityChatInputSchema,
    outputSchema: CommunityChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
