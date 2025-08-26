'use server';

/**
 * @fileOverview A flow to generate fake comments for a new community post.
 *
 * - generateCommunityFeedback - Generates comments for a given post.
 * - GenerateCommunityFeedbackInput - The input type for the function.
 * - GenerateCommunityFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCommunityFeedbackInputSchema = z.object({
  postContent: z.string().describe("The content of the user's new post."),
  postAuthor: z.string().describe("The name of the author of the post."),
  communityArtists: z
    .array(z.string())
    .describe('A list of virtual artists in the community who can comment.'),
});
export type GenerateCommunityFeedbackInput = z.infer<
  typeof GenerateCommunityFeedbackInputSchema
>;

const GenerateCommunityFeedbackOutputSchema = z.object({
  comments: z
    .array(
      z.object({
        author: z.string().describe('The name of the virtual artist commenting.'),
        text: z.string().describe('The content of the comment.'),
      })
    )
    .describe('An array of generated comments.'),
});
export type GenerateCommunityFeedbackOutput = z.infer<
  typeof GenerateCommunityFeedbackOutputSchema
>;

export async function generateCommunityFeedback(
  input: GenerateCommunityFeedbackInput
): Promise<GenerateCommunityFeedbackOutput> {
  return generateCommunityFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCommunityFeedbackPrompt',
  input: {schema: GenerateCommunityFeedbackInputSchema},
  output: {schema: GenerateCommunityFeedbackOutputSchema},
  prompt: `You are an AI that simulates a vibrant, supportive community of poets and writers called "Plume Sonore".
A user named {{{postAuthor}}} has just shared a new creation.
Their post is:
"{{{postContent}}}"

Your task is to generate 2 to 3 short, encouraging, and constructive comments from other members of the community.
The comments should feel authentic and reflect different personalities.
Do not use the author's name in the comments.

Choose from the following list of virtual artists to be the authors of the comments. Do not use {{{postAuthor}}} as a commenter.
- {{#each communityArtists}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Please generate the comments.`,
});

const generateCommunityFeedbackFlow = ai.defineFlow(
  {
    name: 'generateCommunityFeedbackFlow',
    inputSchema: GenerateCommunityFeedbackInputSchema,
    outputSchema: GenerateCommunityFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return (
      output || {
        comments: [],
      }
    );
  }
);
