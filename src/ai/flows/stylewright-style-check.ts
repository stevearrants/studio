'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against the
 * application's embedded Vale-compatible YAML style guide.
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
    .describe('An array of specific Vale rule keys (e.g., Vale.Repetition, MyStyle.PassiveVoice) to focus on. If empty, all rules in the style guide should be considered.'),
  internalStyleGuideText: z
    .string()
    .describe('The full text content of the embedded style guide, formatted as Vale-compatible YAML.'),
});
export type StyleCheckInput = z.infer<typeof StyleCheckInputSchema>;

const StyleCheckOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggestions for adhering to the style guide rules.'),
});
export type StyleCheckOutput = z.infer<typeof StyleCheckOutputSchema>;

export async function styleCheck(input: StyleCheckInput): Promise<StyleCheckOutput> {
  return styleCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleCheckPrompt',
  input: {schema: StyleCheckInputSchema},
  output: {schema: StyleCheckOutputSchema},
  prompt: `You are a style guide expert. Your task is to check the following text based on a set of Vale-compatible style rules provided in YAML format.

Text to check:
{{{text}}}

--- Vale Style Guide (YAML Format) ---
{{{internalStyleGuideText}}}
--- End Vale Style Guide ---

{{#if rules.length}}
Within the provided Vale style guide, pay special attention to these specific Vale rule keys: {{#each rules}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
If no specific rule keys are listed, consider all rules defined in the Vale style guide.
{{else}}
Consider all rules defined in the Vale style guide.
{{/if}}

Interpret the Vale rules from the YAML and provide actionable suggestions to make the text compliant.
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
