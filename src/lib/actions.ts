
'use server';

import { styleCheck, type StyleCheckInput, type StyleCheckOutput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion } from "@/types";
import fs from 'fs/promises';
import path from 'path';

interface CheckTextResult {
  suggestions: Suggestion[] | null;
  error: string | null;
}

async function getEmbeddedStyleGuide(): Promise<string> {
  const styleGuidePath = path.join(process.cwd(), 'src', 'ai', 'styleguides', 'default-style-guide.md');

  try {
    const fileContent = await fs.readFile(styleGuidePath, 'utf-8');
    return fileContent;
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Style guide file not found: ${styleGuidePath}. A default message will be used.`);
      return "The embedded style guide file ('src/ai/styleguides/default-style-guide.md') was not found. Please create this file with your style rules. General spelling and grammar checks will still be performed.";
    }
    console.error("Error reading embedded style guide file:", error);
    return "Error loading the embedded style guide. Please check the server logs. General spelling and grammar checks will still be performed.";
  }
}


export async function checkTextAction(
  inputText: string
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  const styleGuideContent = await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    styleGuideContext: styleGuideContent,
  };

  try {
    const result: StyleCheckOutput = await styleCheck(input);
    const suggestions: Suggestion[] = result.suggestions.map((item, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text: item.suggestionText,
      offendingText: item.offendingText,
    }));
    return { suggestions, error: null };
  } catch (e) {
    console.error("Error in styleCheck AI flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while checking the text.";
    return { suggestions: null, error: `AI Error: ${errorMessage}` };
  }
}
