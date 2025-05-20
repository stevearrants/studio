// Ensures text adheres to a specific style guide.

'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against a selected style guide
 * or a custom uploaded style guide.
 *
 * - styleCheck - A function that checks the input text against a style guide and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  styleGuide: z.string().describe('The name of the base style guide being used (e.g., "Custom StyleWright Guide").'),
  rules: z
    .array(z.string())
    .describe('A list of specific rules or areas of focus from the style guide.'),
  customStyleGuideText: z
    .string()
    .optional()
    .describe('The full text content of a user-uploaded style guide. If provided, this takes precedence.'),
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
  prompt: `You are a style guide expert. Please check the following text.

Text: {{{text}}}

{{#if customStyleGuideText}}
You will use the following custom style guide as the primary source for your checks:
--- Custom Style Guide ---
{{{customStyleGuideText}}}
--- End Custom Style Guide ---
{{else}}
You will check against the '{{{styleGuide}}}'.
Focus on these rules: {{#each rules}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Provide suggestions for adhering to the style guide.
{{#if customStyleGuideText}}
{{#if rules.length}}
Within the custom style guide, pay special attention to aspects related to: {{#each rules}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}
{{/if}}

Return an array of suggestions. Focus on concrete suggestions that can be implemented directly in the document. Ensure each suggestion is a complete, actionable sentence.

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
