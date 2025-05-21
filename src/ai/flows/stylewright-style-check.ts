'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against
 * a an embedded style guide.
 *
 * - styleCheck - A function that checks the input text and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  styleGuideContext: z.string().describe('The content of the style guide to check against.'),
});
export type StyleCheckInput = z.infer<typeof StyleCheckInputSchema>;

const StyleCheckOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggestions for adhering to the style guide.'),
});
export type StyleCheckOutput = z.infer<typeof StyleCheckOutputSchema>;

export async function styleCheck(input: StyleCheckInput): Promise<StyleCheckOutput> {
  return styleCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleCheckPrompt',
  input: {schema: StyleCheckInputSchema},
  output: {schema: StyleCheckOutputSchema},
  prompt: `You are a helpful writing assistant. Your task is to check the following text against the provided style guide.
Identify areas where the text does not adhere to the style guide and provide actionable suggestions for improvement.
Each suggestion should be a complete, actionable sentence.

Style Guide:
{{{styleGuideContext}}}

---
Text to check:
{{{text}}}

---
Suggestions:`,
});

const styleCheckFlow = ai.defineFlow(
  {
    name: 'styleCheckFlow',
    inputSchema: StyleCheckInputSchema,
    outputSchema: StyleCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
