
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
  // offendingText is removed as per user request
});

const StyleCheckOutputSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .describe('An array of suggestions. Each suggestion includes the actionable advice.'),
});
export type StyleCheckOutput = z.infer<typeof StyleCheckOutputSchema>;

// Define a new schema for the prompt's direct input
const StyleCheckPromptInputSchema = StyleCheckInputSchema.extend({
  isStyleGuideCheckMode: z.boolean().describe("True if style guide check mode is active, false if only spell/grammar is active."),
});
type StyleCheckPromptInput = z.infer<typeof StyleCheckPromptInputSchema>;


export async function styleCheck(input: StyleCheckInput): Promise<StyleCheckOutput> {
  return styleCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleCheckPrompt',
  input: {schema: StyleCheckPromptInputSchema}, // Use the extended schema here
  output: {schema: StyleCheckOutputSchema},
  prompt: `You are a helpful writing assistant.

{{#if isStyleGuideCheckMode}}
Your task is to:
1. Thoroughly check the following text for spelling mistakes and grammatical errors.
2. Check the text against the provided style guide (which is in Markdown format).

If the style guide context indicates that it could not be loaded (e.g., messages like "The embedded style guide file... was not found..." or "Error loading the embedded style guide..."), please state that you cannot perform a detailed style check due to a missing/invalid style guide in one of the suggestionText fields, but still perform the spelling and grammar checks and offer general writing advice (e.g., check for clarity, conciseness). Do not attempt to interpret error messages as style rules.

Style Guide Context (Markdown) (This will be used for 'style_guide_check' mode):
{{{styleGuideContext}}}

{{else}}
Your task is to:
1. Meticulously review the following text *solely* for errors in spelling and grammar.
2. Your analysis *must not* include any style guide checks, nor should you make any reference to style guide content or principles.
3. All suggestions you provide must be *strictly* confined to correcting spelling mistakes or grammatical inaccuracies. Do not suggest changes for style, tone, word choice (unless grammatically incorrect or misspelled), sentence structure (unless grammatically incorrect), or conciseness (unless it is a direct result of a grammatical error, such as a run-on sentence).
{{/if}}

For each issue found, provide:
- 'suggestionText': An actionable sentence detailing the suggestion. If in 'spell_grammar_only' mode, this should only be for spelling or grammar. If in 'style_guide_check' mode, it can also be for style guide adherence.

---
Text to check:
{{{text}}}

---
Respond with an array of suggestion objects, each containing 'suggestionText'. If no issues are found, return an empty array for suggestions.`,
});

const styleCheckFlow = ai.defineFlow(
  {
    name: 'styleCheckFlow',
    inputSchema: StyleCheckInputSchema, // External input schema for the flow
    outputSchema: StyleCheckOutputSchema,
  },
  async (flowInput: StyleCheckInput): Promise<StyleCheckOutput> => {
    // Transform the flow input to match the prompt's input schema
    const promptInput: StyleCheckPromptInput = {
      ...flowInput,
      isStyleGuideCheckMode: flowInput.checkMode === 'style_guide_check',
    };
    
    const {output} = await prompt(promptInput);
    // Ensure output is not null and suggestions is an array, even if empty
    return output ?? { suggestions: [] };
  }
);
