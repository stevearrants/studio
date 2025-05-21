
'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking text against
 * an embedded Markdown style guide and also performs general spelling and
 * grammar checks, based on the selected check mode.
 *
 * - styleCheck - A function that checks the input text and returns suggestions.
 * - StyleCheckInput - The input type for the styleCheck function.
 * - StyleCheckOutput - The return type for the styleCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked.'),
  styleGuideContext: z.string().describe("The content of the embedded Markdown style guide. This might also contain an error message if loading the guide failed. This context is used only if checkMode is 'style_guide_check'."),
  checkMode: z.enum(['spell_grammar_only', 'style_guide_check']).describe("Determines the type of check: 'spell_grammar_only' for spelling and grammar, or 'style_guide_check' for full style guide analysis including spelling and grammar."),
});
export type StyleCheckInput = z.infer<typeof StyleCheckInputSchema>;

const SuggestionSchema = z.object({
  suggestionText: z.string().describe('The suggestion for adhering to the style guide, or for correcting spelling/grammar. This should be a complete, actionable sentence.'),
  offendingText: z.string().optional().describe('The exact text snippet from the input that this suggestion pertains to. This MUST be an exact substring of the original input text. Omit if the suggestion is general.'),
});

const StyleCheckOutputSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .describe('An array of suggestions. Each suggestion includes the actionable advice and optionally the specific text segment it refers to.'),
});
export type StyleCheckOutput = z.infer<typeof StyleCheckOutputSchema>;

export async function styleCheck(input: StyleCheckInput): Promise<StyleCheckOutput> {
  return styleCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleCheckPrompt',
  input: {schema: StyleCheckInputSchema},
  output: {schema: StyleCheckOutputSchema},
  prompt: `You are a helpful writing assistant.

{{#if (eq checkMode "style_guide_check")}}
Your task is to:
1. Thoroughly check the following text for spelling mistakes and grammatical errors.
2. Check the text against the provided style guide (which is in Markdown format).

If the style guide context indicates that it could not be loaded (e.g., messages like "The embedded style guide file... was not found..." or "Error loading the embedded style guide..."), please state that you cannot perform a detailed style check due to a missing/invalid style guide in one of the suggestionText fields (without an offendingText), but still perform the spelling and grammar checks and offer general writing advice (e.g., check for clarity, conciseness). Do not attempt to interpret error messages as style rules.

Style Guide Context (Markdown) (This will be used for 'style_guide_check' mode):
{{{styleGuideContext}}}

{{else}}
Your task is to:
1. Thoroughly check the following text *only* for spelling mistakes and grammatical errors.
2. *Do not* perform any style guide checks or refer to any style guide context. Suggestions should be limited to spelling and grammar.
{{/if}}

For each issue found, provide:
- 'suggestionText': An actionable sentence detailing the suggestion. If in 'spell_grammar_only' mode, this should only be for spelling or grammar. If in 'style_guide_check' mode, it can also be for style guide adherence.
- 'offendingText': The exact text snippet from the input that the suggestion directly pertains to. This MUST be an exact substring of the original input text. Omit if the suggestion is general or not applicable to a specific snippet.

---
Text to check:
{{{text}}}

---
Respond with an array of suggestion objects, each containing 'suggestionText' and optionally 'offendingText'. If no issues are found, return an empty array for suggestions.`,
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
