'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against the
 * application's embedded style guide, focusing on user-selected rules.
 *
 * - styleCheck - A function that checks the input text against the style guide and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  rules: z
    .array(z.string())
    .describe('A list of specific rules or areas of focus from the style guide.'),
  internalStyleGuideText: z
    .string()
    .describe('The full text content of the embedded style guide.'),
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
  prompt: `You are a style guide expert. Please check the following text using the provided style guide.

Text:
{{{text}}}

--- Style Guide ---
{{{internalStyleGuideText}}}
--- End Style Guide ---

{{#if rules.length}}
Within the style guide, pay special attention to aspects related to these topics or rules: {{#each rules}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Provide suggestions for adhering to the style guide.
Focus on concrete suggestions that can be implemented directly in the document. Ensure each suggestion is a complete, actionable sentence.

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
