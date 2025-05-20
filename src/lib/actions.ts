"use server";

import { styleCheck, type StyleCheckInput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion } from "@/types";

interface CheckTextResult {
  suggestions: Suggestion[] | null;
  error: string | null;
}

export async function checkTextAction(
  inputText: string,
  selectedRules: string[]
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  if (selectedRules.length === 0) {
    return { suggestions: null, error: "Please select at least one style rule." };
  }

  const input: StyleCheckInput = {
    text: inputText,
    styleGuide: "Custom StyleWright Guide", // Generic name for the dynamically formed guide
    rules: selectedRules,
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
