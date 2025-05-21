
export interface Suggestion {
  id: string;
  text: string;
  offendingText?: string; // Ensures this field is available for the specific text snippet
}

export type CheckMode = "spell_grammar_only" | "style_guide_check";
