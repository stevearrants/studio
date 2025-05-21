'use server';

import { styleCheck, type StyleCheckInput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion } from "@/types"; // StyleRule might be unused now
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
    // Provide a fallback style guide content if the file is missing or unreadable
    return "Default Fallback Style Guide: Ensure clarity, conciseness, and correct grammar. Avoid jargon.";
  }
}

export async function checkTextAction(
  inputText: string
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  const embeddedStyleGuideContent = await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    styleGuideContext: embeddedStyleGuideContent,
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
