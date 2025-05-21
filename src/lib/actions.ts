
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
  const styleGuidesDir = path.join(process.cwd(), 'src', 'ai', 'styleguides', 'vale');
  let combinedStyleGuideContent = "";

  try {
    // Check if directory exists, create if not
    try {
      await fs.access(styleGuidesDir);
    } catch (accessError) {
       if (accessError instanceof Error && 'code' in accessError && (accessError as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.mkdir(styleGuidesDir, { recursive: true });
        console.log(`Created directory: ${styleGuidesDir}`);
        return "The Vale style guide directory 'src/ai/styleguides/vale' was missing and has been created. Please add your .yml or .yaml rule files there.";
      }
      throw accessError; // Re-throw other access errors
    }

    const files = await fs.readdir(styleGuidesDir);
    const yamlFiles = files.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    if (yamlFiles.length === 0) {
      return "No Vale rule files found in the 'src/ai/styleguides/vale' directory. Please add some .yml or .yaml rule files.";
    }

    for (const file of yamlFiles) {
      const filePath = path.join(styleGuidesDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      combinedStyleGuideContent += `--- START OF FILE: ${file} ---\n${fileContent}\n--- END OF FILE: ${file} ---\n\n`;
    }
    // Remove the last two newlines for cleaner concatenation if files were found
    return combinedStyleGuideContent.trim();

  } catch (error) {
    console.error("Error reading Vale style guide directory:", error);
    return "Error loading Vale style guides. Please check the server logs. As a fallback, general writing advice will be provided if possible.";
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
