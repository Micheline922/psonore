'use server';

/**
 * @fileOverview An AI flow for an interactive academy quiz.
 *
 * - generateAcademyQuiz - Generates a new quiz question.
 * - evaluateAcademyQuiz - Evaluates the user's answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas for generating a question
const AcademyQuizQuestionSchema = z.object({
    question: z.string().describe("The quiz question about creative writing."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers (one correct, three incorrect)."),
});
export type AcademyQuizQuestion = z.infer<typeof AcademyQuizQuestionSchema>;

const GenerateAcademyQuizOutputSchema = z.object({
  question: AcademyQuizQuestionSchema,
});

// Schemas for evaluating an answer
export const EvaluateAcademyQuizInputSchema = z.object({
  question: z.string().describe("The original question that was asked."),
  options: z.array(z.string()).describe("The options that were presented."),
  userAnswer: z.string().describe("The answer selected by the user."),
});
export type EvaluateAcademyQuizInput = z.infer<typeof EvaluateAcademyQuizInputSchema>;

export const EvaluateAcademyQuizOutputSchema = z.object({
  isCorrect: z.boolean().describe("Whether the user's answer is correct."),
  explanation: z.string().describe("A brief and clear explanation of the correct answer and why."),
});
export type EvaluateAcademyQuizOutput = z.infer<typeof EvaluateAcademyQuizOutputSchema>;


/**
 * Generates a new quiz question.
 */
export async function generateAcademyQuiz(): Promise<{ question: AcademyQuizQuestion }> {
  return generateAcademyQuizFlow();
}

/**
 * Evaluates a user's quiz answer.
 */
export async function evaluateAcademyQuiz(input: EvaluateAcademyQuizInput): Promise<EvaluateAcademyQuizOutput> {
  return evaluateAcademyQuizFlow(input);
}


// AI Prompt for generating questions
const questionGenerationPrompt = ai.definePrompt({
    name: 'academyQuizGenerator',
    output: { schema: GenerateAcademyQuizOutputSchema },
    prompt: `You are an AI quiz master for a creative writing academy.
    Your task is to generate a single, interesting multiple-choice question about creative writing (poetry, rap, slam, storytelling...).
    The question should be clear and have four distinct options: one correct answer and three plausible but incorrect answers.
    The topics can range from literary devices, rhyme schemes, rhythm, historical context, to famous authors/artists.
    Do not repeat questions. Provide a variety of difficulties.

    Generate a new question now.`,
});

// AI Prompt for evaluating answers
const evaluationPrompt = ai.definePrompt({
    name: 'academyQuizEvaluator',
    input: { schema: EvaluateAcademyQuizInputSchema },
    output: { schema: EvaluateAcademyQuizOutputSchema },
    prompt: `You are an AI teaching assistant. A student has answered a quiz question about creative writing. Your task is to evaluate their answer.

    The question was: "{{question}}"
    The options were: {{{json options}}}
    The student answered: "{{userAnswer}}"

    Your task:
    1. Determine if the user's answer is correct.
    2. Provide a concise, encouraging, and clear explanation for the correct answer. The explanation should be useful even if the user got the answer right. Address the user with "tu".

    Evaluate the answer now.`,
});


const generateAcademyQuizFlow = ai.defineFlow(
  {
    name: 'generateAcademyQuizFlow',
    outputSchema: GenerateAcademyQuizOutputSchema,
  },
  async () => {
    const { output } = await questionGenerationPrompt();
    return output!;
  }
);

const evaluateAcademyQuizFlow = ai.defineFlow(
  {
    name: 'evaluateAcademyQuizFlow',
    inputSchema: EvaluateAcademyQuizInputSchema,
    outputSchema: EvaluateAcademyQuizOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);
