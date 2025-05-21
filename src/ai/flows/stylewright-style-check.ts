'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against
 * a general style guide (either custom uploaded or predefined rules).
 *
 * - styleCheck - A function that checks the input text and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { StyleRule } from '@/types';

const StyleRuleSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  checked: z.boolean().optional().default(false), // Whether this rule is actively focused on
});

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  rules: z.array(StyleRuleSchema).describe('An array of predefined style rules and their active status.'),
  customStyleGuideText: z.string().nullable().describe('Optional custom style guide text provided by the user. If present, this takes precedence.'),
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
  prompt: `You are a helpful writing assistant. Your task is to check the following text against a style guide.

Text to check:
{{{text}}}

--- Style Guide & Rules ---
{{#if customStyleGuideText}}
A custom style guide has been provided. Prioritize its rules.
Custom Style Guide:
{{{customStyleGuideText}}}

{{#if rules.length}}
When considering the custom style guide, also be mindful of the following general aspects if the user has indicated them as areas of focus:
{{#each rules}}
{{#if this.checked}} - {{this.label}}{{#if this.description}} (Focus: {{this.description}}){{/if}}{{/if}}
{{/each}}
{{/if}}

{{else}}
No custom style guide provided. Use the following predefined style rules.
Predefined Style Rules:
{{#each rules}}
- {{this.label}}{{#if this.description}} ({{this.description}}){{/if}}. Focus on this rule: {{#if this.checked}}Yes{{else}}No{{/if}}.
{{/each}}
If a rule is not marked for focus, still consider it if relevant, but give more weight to focused rules.
{{/if}}
--- End Style Guide & Rules ---

Based on the applicable style guide and the indicated focus areas, provide actionable suggestions to improve the text.
Each suggestion should be a complete, actionable sentence.

Suggestions:`,
});

const styleCheckFlow = ai.defineFlow(
  {
    name: 'styleCheckFlow',
    inputSchema: StyleCheckInputSchema,
    outputSchema: StyleCheckOutputSchema,
  },
  async input => {
    // Ensure rules always has a defined 'checked' property for the prompt
    const processedInput = {
      ...input,
      rules: input.rules.map(rule => ({ ...rule, checked: !!rule.checked })),
    };
    const {output} = await prompt(processedInput);
    return output!;
  }
);
