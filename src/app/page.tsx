
"use client";

import React, { useState, useCallback } from "react";
import { Logo } from "@/components/stylewright/Logo";
import { EditorPanel } from "@/components/stylewright/EditorPanel";
import { ControlsAndSuggestionsPanel } from "@/components/stylewright/ControlsAndSuggestionsPanel";
import { checkTextAction } from "@/lib/actions";
import type { Suggestion } from "@/types"; // StyleRule removed as it's no longer used here
import { useToast } from "@/hooks/use-toast";

// predefinedStyleRules is removed as the configuration area is being removed.

export default function StyleWrightPage() {
  const [text, setText] = useState<string>("");
  // selectedRules state and its initialization logic are removed.
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customStyleGuideContent, setCustomStyleGuideContent] = useState<string | null>(null);
  const [customStyleGuideName, setCustomStyleGuideName] = useState<string | null>(null);
  const { toast } = useToast();

  // useEffect for defaultSelected rules is removed.

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  // handleSelectedRulesChange is removed.

  const handleCheckText = useCallback(async () => {
    // Check for selectedRules.length is removed as rules are no longer user-selectable.
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

    // activeRuleLabels will now be an empty array as specific rules are not selected by the user.
    // The AI flow is designed to use the entire embedded style guide if no specific rules are passed.
    const result = await checkTextAction(text, [], customStyleGuideContent); 
    
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
  }, [text, customStyleGuideContent, toast]);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    toast({ description: "Suggestion dismissed." });
  }, [toast]);

  const handleUploadCustomStyleGuide = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target?.result as string;
      setCustomStyleGuideContent(fileText);
      setCustomStyleGuideName(file.name);
      toast({ title: "Custom style guide uploaded.", description: file.name });
    };
    reader.onerror = () => {
      toast({ title: "Error reading style guide file.", variant: "destructive" });
    };
    reader.readAsText(file);
  }, [toast]);

  const handleRemoveCustomStyleGuide = useCallback(() => {
    setCustomStyleGuideContent(null);
    setCustomStyleGuideName(null);
    toast({ description: "Custom style guide removed. Using default guide." });
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
            // Props related to styleRules and selectedRules are removed
            onCheckText={handleCheckText}
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onDismissSuggestion={handleDismissSuggestion}
            customStyleGuideName={customStyleGuideName}
            onUploadCustomStyleGuide={handleUploadCustomStyleGuide}
            onRemoveCustomStyleGuide={handleRemoveCustomStyleGuide}
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
