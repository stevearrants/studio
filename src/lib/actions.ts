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
    // Changed to read the YAML file
    const filePath = path.join(process.cwd(), 'src', 'ai', 'styleguides', 'default-vale-rules.yml');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error("Error reading embedded Vale style guide:", error);
    // Fallback to a minimal message if file reading fails
    return "Vale.Spelling = YES\n# Default fallback: Focus on basic spelling.";
  }
}

export async function checkTextAction(
  inputText: string,
  // selectedRuleKeys would be Vale rule keys if UI for selection existed
  selectedRuleKeys: string[], 
  customStyleGuideContent: string | null // Retained for consistency, though UI removed
): Promise<CheckTextResult> {
  if (!inputText.trim()) {
    return { suggestions: [], error: null };
  }
  
  // If a custom style guide is uploaded, use it. Otherwise, use the embedded one.
  const styleGuideToUse = customStyleGuideContent ?? await getEmbeddedStyleGuide();

  const input: StyleCheckInput = {
    text: inputText,
    // 'rules' now refers to specific Vale rule keys to focus on, if provided.
    // Currently, page.tsx passes an empty array.
    rules: selectedRuleKeys, 
    internalStyleGuideText: styleGuideToUse, // This will be the YAML content
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
