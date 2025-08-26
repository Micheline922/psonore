'use server';

/**
 * @fileOverview An AI flow for a virtual academy quiz.
 *
 * - generateAcademyQuiz - Generates a multiple-choice question.
 * - evaluateAcademyQuiz - Evaluates the user's answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AcademyQuizAnswer, AcademyQuizQuestion } from '@/lib/types';

// Define Zod schemas for internal use, but don't export them from here.
const AcademyQuizQuestionSchema = z.object({
  question: z.string().describe('The multiple-choice question about creative writing.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  correctAnswerIndex: z.number().int().min(0).max(3).describe('The index of the correct answer in the options array.'),
});

const AcademyQuizAnswerSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user\'s answer was correct.'),
  explanation: z.string().describe('A brief explanation of the correct answer and why the other options are wrong.'),
});

const EvaluateAcademyQuizInputSchema = z.object({
    question: AcademyQuizQuestionSchema.omit({ correctAnswerIndex: true }),
    userAnswerIndex: z.number().int().min(0).max(3),
    originalQuestion: AcademyQuizQuestionSchema, // Pass the full original question with answer
});


/**
 * Generates a new quiz question.
 */
export async function generateAcademyQuiz(): Promise<AcademyQuizQuestion> {
  return generateAcademyQuizFlow();
}

/**
 * Evaluates a user's submitted answer.
 */
export async function evaluateAcademyQuiz(input: { question: Omit<AcademyQuizQuestion, 'correctAnswerIndex'>; userAnswerIndex: number, originalQuestion: AcademyQuizQuestion }): Promise<AcademyQuizAnswer> {
  return evaluateAcademyQuizFlow(input);
}

// AI Prompt for generating challenges
const quizGenerationPrompt = ai.definePrompt({
    name: 'academyQuizGenerator',
    output: { schema: AcademyQuizQuestionSchema },
    prompt: `You are an AI assistant for a creative writing academy. Your task is to generate a single, interesting multiple-choice question about creative writing (poetry, slam, rap, storytelling...).
    
    The question should be in French.
    The question should have 4 possible answers.
    You must identify the index of the correct answer.
    The difficulty should be suitable for beginners or intermediate artists.

    Example:
    Question: "Dans un poème, qu'est-ce qu'une métaphore ?"
    Options: ["Une rime à la fin d'un vers", "Une comparaison directe sans utiliser 'comme' ou 'tel'", "Le nombre de syllabes dans un vers", "Un groupe de quatre vers"]
    Correct Answer Index: 1

    Generate a new question now.`,
});

// AI Prompt for evaluating answers
const evaluationPrompt = ai.definePrompt({
    name: 'academyQuizEvaluator',
    input: { schema: EvaluateAcademyQuizInputSchema },
    output: { schema: AcademyQuizAnswerSchema },
    prompt: `You are an AI writing tutor. A user has answered a quiz question. Evaluate their answer.

    The question was: "{{originalQuestion.question}}"
    The options were: {{json originalQuestion.options}}
    The correct answer was: "{{originalQuestion.options[originalQuestion.correctAnswerIndex]}}"
    The user chose: "{{originalQuestion.options[userAnswerIndex]}}"

    Determine if the user's answer is correct.
    Then, provide a brief, clear, and encouraging explanation for the correct answer. Address the user with "tu".`,
});


// Flow for generating challenges
const generateAcademyQuizFlow = ai.defineFlow(
  {
    name: 'generateAcademyQuizFlow',
    outputSchema: AcademyQuizQuestionSchema,
  },
  async () => {
    const { output } = await quizGenerationPrompt();
    return output!;
  }
);

// Flow for evaluating answers
const evaluateAcademyQuizFlow = ai.defineFlow(
  {
    name: 'evaluateAcademyQuizFlow',
    inputSchema: EvaluateAcademyQuizInputSchema,
    outputSchema: AcademyQuizAnswerSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);
