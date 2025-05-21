
"use client";

import React, { useState, useCallback } from "react";
import { Logo } from "@/components/stylewright/Logo";
import { EditorPanel } from "@/components/stylewright/EditorPanel";
import { ControlsAndSuggestionsPanel } from "@/components/stylewright/ControlsAndSuggestionsPanel";
import { checkTextAction } from "@/lib/actions";
import type { Suggestion, CheckMode } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function StyleWrightPage() {
  const [text, setText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkMode, setCheckMode] = useState<CheckMode>("spell_grammar_only");
  const { toast } = useToast();
  // textareaRef is removed

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleCheckModeChange = useCallback((mode: CheckMode) => {
    setCheckMode(mode);
  }, []);

  const handleCheckText = useCallback(async () => {
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
    
    const result = await checkTextAction(text, checkMode);

    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setSuggestions([]); 
    } else if (result.suggestions) {
      setSuggestions(result.suggestions);
      if (result.suggestions.length > 0) {
        toast({
          title: "Suggestions Ready",
          description: `Found ${result.suggestions.length} suggestion(s).`,
        });
      } else {
        toast({
          title: "All Clear!",
          description: "No issues found based on the selected check mode.",
        });
      }
    }
    setIsLoading(false);
  }, [text, checkMode, toast]);

  const handleDismissSuggestion = useCallback(
    (suggestionId: string) => {
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      toast({ description: "Suggestion dismissed." });
    },
    [toast]
  );

  // handleSuggestionClick is removed

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <Logo />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <EditorPanel
            // ref is removed
            text={text}
            onTextChange={handleTextChange}
            onCheckText={handleCheckText}
            isLoading={isLoading}
            currentCheckMode={checkMode}
            onCheckModeChange={handleCheckModeChange}
          />
          <ControlsAndSuggestionsPanel
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onDismissSuggestion={handleDismissSuggestion}
            // onSuggestionClick is removed
          />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built with Firebase Studio &amp; Next.js. &copy; {new Date().getFullYear()} The Old Tech Writer.
          </p>
        </div>
      </footer>
    </div>
  );
}
