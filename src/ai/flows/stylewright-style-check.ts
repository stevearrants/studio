'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against
 * an embedded Vale style guide (potentially from multiple YAML files).
 *
 * - styleCheck - A function that checks the input text and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  styleGuideContext: z.string().describe('The content of the Vale style guide (potentially from multiple YAML files, concatenated and demarcated). This might also contain error messages if loading rules failed.'),
});
export type StyleCheckInput = z.infer<typeof StyleCheckInputSchema>;

const StyleCheckOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggestions for adhering to the style guide. Each suggestion should be a complete, actionable sentence.'),
});
export type StyleCheckOutput = z.infer<typeof StyleCheckOutputSchema>;

export async function styleCheck(input: StyleCheckInput): Promise<StyleCheckOutput> {
  return styleCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleCheckPrompt',
  input: {schema: StyleCheckInputSchema},
  output: {schema: StyleCheckOutputSchema},
  prompt: `You are a helpful writing assistant. Your task is to check the following text against the provided Vale style guide rules.
The style guide context below contains Vale rules, potentially from multiple .yml files. Each set of rules from a file is demarcated by '--- START OF FILE: <filename> ---' and '--- END OF FILE: <filename> ---'.
Consider all these rules collectively.

If the style guide context indicates that no rules were found (e.g., messages like "No Vale rule files found..." or "The Vale style guide directory... was missing...") or an error occurred loading them, please state that you cannot perform a detailed style check due to missing/invalid rules, but offer general writing advice (e.g., check for clarity, conciseness, and basic grammar). Do not attempt to interpret error messages as style rules.

Style Guide Context:
{{{styleGuideContext}}}

---
Text to check:
{{{text}}}

---
Suggestions (provide each suggestion as an actionable sentence):`,
});

const styleCheckFlow = ai.defineFlow(
  {
    name: 'styleCheckFlow',
    inputSchema: StyleCheckInputSchema,
    outputSchema: StyleCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure output is not null and suggestions is an array, even if empty
    return output ?? { suggestions: [] };
  }
);