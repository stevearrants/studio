'use server';

import { styleCheck, type StyleCheckInput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion, StyleRule } from "@/types";
import fs from 'fs/promises';
import path from 'path';

interface CheckTextResult {
  suggestions: Suggestion[] | null;
  error: string | null;
}

async function getEmbeddedStyleGuide(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'ai', 'styleguides', 'default-style-guide.md');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error("Error reading embedded style guide:", error);
    return "Default fallback: Focus on clarity and conciseness.";
  }
}

export async function checkTextAction(
  inputText: string,
  activeStyleRules: StyleRule[],
  customStyleGuideContent: string | null
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  const styleGuideToUseForCustomText = customStyleGuideContent ?? await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    rules: activeStyleRules, // These are the predefined rules with their checked status
    customStyleGuideText: customStyleGuideContent, // This is the user-uploaded guide, if any
  };

  // If no custom guide is uploaded, the prompt logic will use the 'rules' (predefined ones) 
  // with the embedded guide text (which isn't directly passed to the AI as customStyleGuideText 
  // but its principles are what the predefined rules should reflect).
  // The AI prompt handles whether customStyleGuideText is null.

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
