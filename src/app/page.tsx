"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Logo } from "@/components/stylewright/Logo";
import { EditorPanel } from "@/components/stylewright/EditorPanel";
import { ControlsAndSuggestionsPanel } from "@/components/stylewright/ControlsAndSuggestionsPanel";
import { checkTextAction } from "@/lib/actions";
import type { StyleRule, Suggestion } from "@/types";
import { useToast } from "@/hooks/use-toast";

const predefinedStyleRules: StyleRule[] = [
  { id: "active-voice", label: "Use active voice", description: "Prefer active voice over passive voice for clarity and directness.", defaultChecked: true },
  { id: "simple-words", label: "Prefer simple words", description: "Avoid complex jargon; e.g., use 'use' instead of 'utilize'.", defaultChecked: true },
  { id: "oxford-comma", label: "Use Oxford comma", description: "Ensure consistent use of serial (Oxford) commas.", defaultChecked: false },
  { id: "numbers-usage", label: "Spell out numbers 1-9", description: "Spell out numbers one through nine; use numerals for 10 and above.", defaultChecked: true },
  { id: "avoid-cliches", label: "Avoid clichés", description: "Refrain from using clichés and overused phrases for more original writing.", defaultChecked: false },
  { id: "grammar-check", label: "Check grammar", description: "Identify common grammatical errors like subject-verb agreement, pronoun consistency.", defaultChecked: true },
  { id: "spelling-check", label: "Check spelling", description: "Ensure correct spelling throughout the text.", defaultChecked: true },
  { id: "conciseness", label: "Be concise", description: "Eliminate wordiness and redundant phrases.", defaultChecked: true },
  { id: "consistent-tense", label: "Consistent tense", description: "Maintain consistent verb tenses throughout your writing.", defaultChecked: true },
];


export default function StyleWrightPage() {
  const [text, setText] = useState<string>("");
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const defaultSelected = predefinedStyleRules
      .filter(rule => rule.defaultChecked)
      .map(rule => rule.id);
    setSelectedRules(defaultSelected);
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleSelectedRulesChange = useCallback((ruleId: string, checked: boolean) => {
    setSelectedRules((prev) =>
      checked ? [...prev, ruleId] : prev.filter((id) => id !== ruleId)
    );
  }, []);

  const handleCheckText = useCallback(async () => {
    if (selectedRules.length === 0) {
      toast({
        title: "No rules selected",
        description: "Please select at least one style area to focus on.",
        variant: "destructive",
      });
      return;
    }
    if (!text.trim()) {
       toast({
        title: "No text provided",
        description: "Please enter some text to check.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const activeRuleLabels = predefinedStyleRules
      .filter(rule => selectedRules.includes(rule.id))
      .map(rule => rule.label);

    // Pass only text and activeRuleLabels, customStyleGuideText is handled by the action internally
    const result = await checkTextAction(text, activeRuleLabels); 
    
    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.suggestions) {
      setSuggestions(result.suggestions);
      if (result.suggestions.length > 0) {
        toast({
          title: "Suggestions Ready",
          description: `Found ${result.suggestions.length} suggestion(s).`,
          variant: "default",
        });
      } else {
         toast({
          title: "All Clear!",
          description: "No suggestions found based on the current criteria.",
          variant: "default",
        });
      }
    }
    setIsLoading(false);
  }, [text, selectedRules, toast]);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    toast({ description: "Suggestion dismissed." });
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <Logo />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <EditorPanel text={text} onTextChange={handleTextChange} />
          <ControlsAndSuggestionsPanel
            styleRules={predefinedStyleRules}
            selectedRules={selectedRules}
            onSelectedRulesChange={handleSelectedRulesChange}
            onCheckText={handleCheckText}
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onDismissSuggestion={handleDismissSuggestion}
            // Removed props related to custom style guides
          />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built with Firebase Studio & Next.js. &copy; {new Date().getFullYear()} StyleWright.
          </p>
        </div>
      </footer>
    </div>
  );
}
