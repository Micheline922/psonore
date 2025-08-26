'use server';

/**
 * @fileOverview An AI flow for a punchline creation quiz.
 *
 * - generateQuizChallenge - Generates a set of words for a punchline challenge.
 * - evaluatePunchline - Evaluates a user's punchline based on given words.
 * - GenerateQuizChallengeOutput - The return type for generateQuizChallenge.
 * - EvaluatePunchlineInput - The input type for evaluatePunchline.
 * - EvaluatePunchlineOutput - The return type for evaluatePunchline.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for generating a challenge
const GenerateQuizChallengeOutputSchema = z.object({
  words: z.array(z.string()).describe('A list of 3 to 5 words to use in a punchline.'),
});
export type GenerateQuizChallengeOutput = z.infer<typeof GenerateQuizChallengeOutputSchema>;

// Schema for evaluating a punchline
const EvaluatePunchlineInputSchema = z.object({
  challengeWords: z.array(z.string()).describe('The words the user was challenged with.'),
  userPunchline: z.string().describe("The punchline created by the user."),
});
export type EvaluatePunchlineInput = z.infer<typeof EvaluatePunchlineInputSchema>;

const EvaluatePunchlineOutputSchema = z.object({
  score: z.number().min(0).max(10).describe('The score for the punchline, from 0 to 10.'),
  feedback: z.string().describe('Constructive feedback and suggestions for improvement.'),
});
export type EvaluatePunchlineOutput = z.infer<typeof EvaluatePunchlineOutputSchema>;


/**
 * Generates a new punchline challenge.
 */
export async function generateQuizChallenge(): Promise<GenerateQuizChallengeOutput> {
  return generateQuizChallengeFlow();
}

/**
 * Evaluates a user's submitted punchline.
 */
export async function evaluatePunchline(input: EvaluatePunchlineInput): Promise<EvaluatePunchlineOutput> {
  return evaluatePunchlineFlow(input);
}


// AI Prompt for generating challenges
const challengeGenerationPrompt = ai.definePrompt({
    name: 'punchlineChallengeGenerator',
    output: { schema: GenerateQuizChallengeOutputSchema },
    prompt: `You are an AI assistant for a creative writing app. Your task is to generate a set of 3 to 5 interesting, evocative, or contrasting French words for a user to create a punchline or a short poetic quote.

    Examples of word sets:
    - "Miroir, Poussière, Écho, Silence"
    - "Néon, Pluie, Fantôme"
    - "Béton, Rose, Cicatrice"
    - "Horloge, Murmure, Clé"

    Generate a new set of words now.`,
});

// AI Prompt for evaluating punchlines
const evaluationPrompt = ai.definePrompt({
    name: 'punchlineEvaluator',
    input: { schema: EvaluatePunchlineInputSchema },
    output: { schema: EvaluatePunchlineOutputSchema },
    prompt: `You are an AI critic and writing coach named "Le Juge". A user was given a set of words and asked to create a punchline or a short poetic quote. Your task is to evaluate their submission.

    The user was given these words: {{{json challengeWords}}}
    The user wrote: "{{userPunchline}}"

    Your evaluation must be fair, constructive, and encouraging.
    1.  **Score**: Give a score from 0 to 10. Consider creativity, emotional impact, cleverness, and the use of the given words.
    2.  **Feedback**: Provide brief, actionable feedback. Start with what you liked, then suggest one or two ways to make it even more powerful. Address the user in the "tu" form.

    Generate the score and feedback now.`,
});


// Flow for generating challenges
const generateQuizChallengeFlow = ai.defineFlow(
  {
    name: 'generateQuizChallengeFlow',
    outputSchema: GenerateQuizChallengeOutputSchema,
  },
  async () => {
    const { output } = await challengeGenerationPrompt();
    return output!;
  }
);

// Flow for evaluating punchlines
const evaluatePunchlineFlow = ai.defineFlow(
  {
    name: 'evaluatePunchlineFlow',
    inputSchema: EvaluatePunchlineInputSchema,
    outputSchema: EvaluatePunchlineOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);
