// Ensures text adheres to a specific style guide.

'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against a selected style guide.
 *
 * - styleCheck - A function that checks the input text against a selected style guide and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  styleGuide: z.string().describe('The selected style guide to check against.'),
  rules: z
    .array(z.string())
    .describe('The set of rules to apply from the selected style guide.'),
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
  prompt: `You are a style guide expert. Please check the following text against the selected style guide and rules.

Text: {{{text}}}
Style Guide: {{{styleGuide}}}
Rules: {{#each rules}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Provide suggestions for adhering to the style guide. Return an array of suggestions. Focus on concrete suggestions that can be implemented directly in the document.

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
