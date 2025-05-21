
'use server';

import { styleCheck, type StyleCheckInput, type StyleCheckOutput } from "@/ai/flows/stylewright-style-check";
import type { Suggestion, CheckMode } from "@/types";
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
    if (!fileContent.trim()) {
      return "The embedded style guide file ('src/ai/styleguides/default-style-guide.md') is empty. Please add your style rules to this file. If 'Style Guide Check' mode is selected, only general spelling and grammar checks might be performed if the guide is empty.";
    }
    return fileContent;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      console.warn(`Style guide file not found: ${styleGuidePath}. Attempting to create it.`);
      try {
        await fs.mkdir(path.dirname(styleGuidePath), { recursive: true });
        await fs.writeFile(styleGuidePath, '# Your Style Guide\n\nStart adding your Markdown-based style rules here.\n');
        return "The embedded style guide file was not found, so a default one has been created at 'src/ai/styleguides/default-style-guide.md'. Please add your style rules to this file. For now, if 'Style Guide Check' mode is selected, general spelling and grammar checks will be performed.";
      } catch (creationError) {
        console.error(`Error creating default style guide file at ${styleGuidePath}:`, creationError);
        return `Error: The style guide file was not found at ${styleGuidePath}, and an attempt to create it failed. Please check file permissions and ensure the directory structure is valid. If 'Style Guide Check' mode is selected, general spelling and grammar checks will still be performed.`;
      }
    }
    console.error(`Error reading embedded style guide file at ${styleGuidePath}:`, error);
    return "Error loading the embedded style guide. Please check the server logs. If 'Style Guide Check' mode is selected, general spelling and grammar checks will still be performed.";
  }
}


export async function checkTextAction(
  inputText: string,
  checkMode: CheckMode
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  const styleGuideContent = await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    styleGuideContext: styleGuideContent, 
    checkMode: checkMode,
  };

  try {
    const result: StyleCheckOutput = await styleCheck(input);
    const suggestions: Suggestion[] = result.suggestions.map((item, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text: item.suggestionText,
      // offendingText: item.offendingText, // Removed
    }));
    return { suggestions, error: null };
  } catch (e) {
    console.error("Error in styleCheck AI flow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while checking the text.";
    return { suggestions: null, error: `AI Error: ${errorMessage}` };
  }
}
