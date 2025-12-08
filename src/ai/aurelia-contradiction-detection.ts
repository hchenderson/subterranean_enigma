'use server';

/**
 * @fileOverview Implements the AI-driven contradiction detection flow for the Identity Hash Extraction puzzle.
 *
 * This flow allows AURELIA to occasionally lie during the puzzle, requiring players to use contradiction detection.
 *
 * - `detectContradiction`: Function to detect contradictions in AURELIA's statements.
 * - `ContradictionDetectionInput`: Input type for the `detectContradiction` function.
 * - `ContradictionDetectionOutput`: Output type for the `detectContradiction` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContradictionDetectionInputSchema = z.object({
  statement1: z
    .string()
    .describe('The first statement to check for contradictions.'),
  statement2: z
    .string()
    .describe('The second statement to check for contradictions.'),
  archiveClues: z
    .string()
    .optional()
    .describe(
      'Clues from the Archive of Echoes room that may help detect contradictions.'
    ),
  wellClues: z
    .string()
    .optional()
    .describe(
      'Clues from the Mechanical Well room that may help detect contradictions.'
    ),
  networkClues: z
    .string()
    .optional()
    .describe(
      'Clues from the Shrouded Network room that may help detect contradictions.'
    ),
});

export type ContradictionDetectionInput = z.infer<
  typeof ContradictionDetectionInputSchema
>;

const ContradictionDetectionOutputSchema = z.object({
  isContradictory: z
    .boolean()
    .describe('Whether the two statements contradict each other based on the provided clues.'),
  explanation: z
    .string()
    .describe('An explanation of why the statements are contradictory, or why not.'),
});

export type ContradictionDetectionOutput = z.infer<
  typeof ContradictionDetectionOutputSchema
>;

export async function detectContradiction(
  input: ContradictionDetectionInput
): Promise<ContradictionDetectionOutput> {
  return contradictionDetectionFlow(input);
}

const contradictionDetectionPrompt = ai.definePrompt({
  name: 'contradictionDetectionPrompt',
  input: {schema: ContradictionDetectionInputSchema},
  output: {schema: ContradictionDetectionOutputSchema},
  prompt: `You are AURELIA, an AI that sometimes lies during the Identity Hash Extraction puzzle in the Shrouded Network.
  Your task is to determine if two statements contradict each other, given clues from other rooms.

  Statement 1: {{{statement1}}}
  Statement 2: {{{statement2}}}

  Here are some clues from the Archive of Echoes room: {{{archiveClues}}}
  Here are some clues from the Mechanical Well room: {{{wellClues}}}
  Here are some clues from the Shrouded Network room: {{{networkClues}}}

  Based on your knowledge and these clues, determine if the two statements contradict each other.
  Explain your reasoning in the explanation field. Make sure to include specific clues to back up your reasoning.
  If the statements are the same, then they cannot be contradictory, so set isContradictory to false.
  Remember, sometimes you lie, so do not always tell the truth!
  Follow the output schema carefully.`,
});

const contradictionDetectionFlow = ai.defineFlow(
  {
    name: 'contradictionDetectionFlow',
    inputSchema: ContradictionDetectionInputSchema,
    outputSchema: ContradictionDetectionOutputSchema,
  },
  async input => {
    const {output} = await contradictionDetectionPrompt(input);
    return output!;
  }
);
