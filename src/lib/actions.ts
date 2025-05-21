'use server';

import { styleCheck, type StyleCheckInput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion } from "@/types";
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
    // Fallback to a minimal style guide if file reading fails
    return "Default Style Guide: Focus on clarity and conciseness. Use active voice. Check for spelling and grammar errors.";
  }
}

export async function checkTextAction(
  inputText: string,
  selectedRules: string[]
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  if (selectedRules.length === 0) {
    return { suggestions: null, error: "Please select at least one style rule to focus on." };
  }

  const internalStyleGuideText = await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    rules: selectedRules,
    internalStyleGuideText: internalStyleGuideText,
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
