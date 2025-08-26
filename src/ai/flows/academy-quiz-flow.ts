'use server';

/**
 * @fileOverview An AI flow for a creative writing academy quiz.
 *
 * - generateAcademyQuiz - Generates a new quiz.
 * - evaluateAcademyQuiz - Evaluates a single quiz answer.
 * - AcademyQuizQuestion - The type for a single quiz question.
 * - AcademyQuizAnswer - The type for a quiz answer submission.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas
export const AcademyQuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
});
export type AcademyQuizQuestion = z.infer<typeof AcademyQuizQuestionSchema>;

export const AcademyQuizAnswerSchema = z.object({
    question: AcademyQuizQuestionSchema,
    selectedAnswer: z.string().describe("The user's selected answer."),
});
export type AcademyQuizAnswer = z.infer<typeof AcademyQuizAnswerSchema>;

const GenerateAcademyQuizOutputSchema = z.object({
    questions: z.array(AcademyQuizQuestionSchema).length(5).describe("An array of 5 quiz questions."),
});

const EvaluateAcademyQuizOutputSchema = z.object({
    isCorrect: z.boolean().describe('Whether the answer is correct.'),
    feedback: z.string().describe('A short, encouraging feedback sentence explaining the correct answer.'),
});


/**
 * Generates a new 5-question quiz.
 */
export async function generateAcademyQuiz(): Promise<z.infer<typeof GenerateAcademyQuizOutputSchema>> {
  return generateAcademyQuizFlow();
}

/**
 * Evaluates a user's submitted answer.
 */
export async function evaluateAcademyQuiz(input: AcademyQuizAnswer): Promise<z.infer<typeof EvaluateAcademyQuizOutputSchema>> {
  return evaluateAcademyQuizFlow(input);
}


// AI Prompt for generating quizzes
const quizGenerationPrompt = ai.definePrompt({
    name: 'academyQuizGenerator',
    output: { schema: GenerateAcademyQuizOutputSchema },
    prompt: `You are an AI assistant for a creative writing app, "Plume Sonore". Your task is to generate a 5-question multiple-choice quiz about creative writing concepts (poetry, slam, rap, storytelling).
    
    The questions should cover a range of topics from beginner to intermediate, including things like rhyme schemes, literary devices (metaphor, simile, alliteration), rhythm, storytelling structure, and punchlines.
    
    For each question, provide the question text, 4 plausible options, and clearly identify the correct answer. The questions and answers must be in French.`,
});

// AI Prompt for evaluating answers
const evaluationPrompt = ai.definePrompt({
    name: 'academyQuizEvaluator',
    input: { schema: AcademyQuizAnswerSchema },
    output: { schema: EvaluateAcademyQuizOutputSchema },
    prompt: `You are an AI quiz evaluator for "Plume Sonore". A user has answered a question. Your task is to determine if their answer is correct and provide brief, encouraging feedback.

    The user was asked: "{{question.questionText}}"
    The options were: {{json question.options}}
    The correct answer is: "{{question.correctAnswer}}"
    The user selected: "{{selectedAnswer}}"

    1.  Determine if the user's answer is correct.
    2.  Write a short feedback sentence. If the user is correct, congratulate them. If they are incorrect, gently correct them and briefly explain why the right answer is correct. The feedback must be in French. For example: "Correct ! La métaphore compare deux choses sans utiliser de mot de comparaison." or "Pas tout à fait. La bonne réponse est 'AABB', ce qu'on appelle une rime suivie."
    
    Generate the evaluation now.`,
});


// Flow for generating quizzes
const generateAcademyQuizFlow = ai.defineFlow(
  {
    name: 'generateAcademyQuizFlow',
    outputSchema: GenerateAcademyQuizOutputSchema,
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
    inputSchema: AcademyQuizAnswerSchema,
    outputSchema: EvaluateAcademyQuizOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);
