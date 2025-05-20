// 'use server';

/**
 * @fileOverview A flow for generating style guide suggestions based on a sample of text.
 *
 * - generateStyleGuideSuggestions - A function that generates style guide suggestions.
 * - GenerateStyleGuideSuggestionsInput - The input type for the generateStyleGuideSuggestions function.
 * - GenerateStyleGuideSuggestionsOutput - The return type for the generateStyleGuideSuggestions function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStyleGuideSuggestionsInputSchema = z.object({
  textSample: z
    .string()
    .describe('A sample of text to generate style guide suggestions from.'),
});
export type GenerateStyleGuideSuggestionsInput = z.infer<
  typeof GenerateStyleGuideSuggestionsInputSchema
>;

const GenerateStyleGuideSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of style guide suggestions.'),
});
export type GenerateStyleGuideSuggestionsOutput = z.infer<
  typeof GenerateStyleGuideSuggestionsOutputSchema
>;

export async function generateStyleGuideSuggestions(
  input: GenerateStyleGuideSuggestionsInput
): Promise<GenerateStyleGuideSuggestionsOutput> {
  return generateStyleGuideSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStyleGuideSuggestionsPrompt',
  input: {schema: GenerateStyleGuideSuggestionsInputSchema},
  output: {schema: GenerateStyleGuideSuggestionsOutputSchema},
  prompt: `You are an expert style guide writer.

  Based on the following text sample, generate a list of style guide suggestions.

  Text Sample: {{{textSample}}}

  Suggestions:`,
});

const generateStyleGuideSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateStyleGuideSuggestionsFlow',
    inputSchema: GenerateStyleGuideSuggestionsInputSchema,
    outputSchema: GenerateStyleGuideSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
