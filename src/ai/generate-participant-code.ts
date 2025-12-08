
'use server';

/**
 * @fileOverview A flow to generate a user-friendly, two-word participant code.
 *
 * - `generateParticipantCode`: Generates a unique, memorable code for participants.
 * - `ParticipantCodeOutput`: The output type for the `generateParticipantCode` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParticipantCodeOutputSchema = z.object({
  code: z.string().describe('A two-word, hyphenated, all-caps code that is easy to remember and type. For example: "COSMIC-BEACON" or "SILVER-PHOENIX".'),
});

export type ParticipantCodeOutput = z.infer<typeof ParticipantCodeOutputSchema>;

export async function generateParticipantCode(): Promise<ParticipantCodeOutput> {
  return generateParticipantCodeFlow();
}

const participantCodePrompt = ai.definePrompt({
  name: 'participantCodePrompt',
  output: { schema: ParticipantCodeOutputSchema },
  prompt: `Generate a unique and memorable two-word code for a participant in a sci-fi escape room game. The code should be hyphenated, all-caps, and consist of two evocative words. Examples: "VOID-WALKER", "STAR-DUST", "NEBULA-SONG".`,
});

const generateParticipantCodeFlow = ai.defineFlow(
  {
    name: 'generateParticipantCodeFlow',
    outputSchema: ParticipantCodeOutputSchema,
  },
  async () => {
    const { output } = await participantCodePrompt();
    return output!;
  }
);

    