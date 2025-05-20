"use server";

import { styleCheck, type StyleCheckInput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion } from "@/types";

interface CheckTextResult {
  suggestions: Suggestion[] | null;
  error: string | null;
}

export async function checkTextAction(
  inputText: string,
  selectedRules: string[],
  customStyleGuideText: string | null
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  // It's okay if no specific rules are selected if a custom style guide is provided.
  if (selectedRules.length === 0 && !customStyleGuideText) {
    return { suggestions: null, error: "Please select at least one style rule or upload a custom style guide." };
  }

  const input: StyleCheckInput = {
    text: inputText,
    styleGuide: "Custom StyleWright Guide", 
    rules: selectedRules,
    customStyleGuideText: customStyleGuideText ?? undefined,
  };

  try {
    const result = await styleCheck(input);
    const suggestions = result.suggestions.map((text, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text,
    }));
    return { suggestions, error: null };
  } catch (e) {
    console.error("Error in styleCheck AI flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while checking the text.";
    return { suggestions: null, error: `AI Error: ${errorMessage}` };
  }
}
