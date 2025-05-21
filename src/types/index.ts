
export interface Suggestion {
  id: string;
  text: string;
  // offendingText?: string; // Removed as per user request
}

export type CheckMode = "spell_grammar_only" | "style_guide_check";
