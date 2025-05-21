
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Logo } from "@/components/stylewright/Logo";
import { EditorPanel } from "@/components/stylewright/EditorPanel";
import { ControlsAndSuggestionsPanel } from "@/components/stylewright/ControlsAndSuggestionsPanel";
import { checkTextAction } from "@/lib/actions";
import type { Suggestion, StyleRule } from "@/types";
import { useToast } from "@/hooks/use-toast";

const defaultStyleRules: StyleRule[] = [
  { id: 'spelling', label: 'Spelling', description: 'Check for basic spelling errors.', defaultChecked: true },
  { id: 'grammar', label: 'Grammar', description: 'Check for common grammatical mistakes.', defaultChecked: true },
  { id: 'clarity', label: 'Clarity', description: 'Ensure text is clear and easy to understand.', defaultChecked: false },
  { id: 'conciseness', label: 'Conciseness', description: 'Avoid wordiness and unnecessary phrases.', defaultChecked: false },
  { id: 'tone', label: 'Tone Consistency', description: 'Maintain a consistent tone.', defaultChecked: false },
  { id: 'avoid-passive-voice', label: 'Avoid Passive Voice', description: 'Prefer active voice for directness.', defaultChecked: false },
  { id: 'sentence-length', label: 'Sentence Length', description: 'Check for overly long or short sentences.', defaultChecked: false },
];


export default function StyleWrightPage() {
  const [text, setText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [styleRules, setStyleRules] = useState<StyleRule[]>(() => 
    defaultStyleRules.map(rule => ({...rule, checked: rule.defaultChecked || false }))
  );
  const [customStyleGuideContent, setCustomStyleGuideContent] = useState<string | null>(null);
  const [customStyleGuideName, setCustomStyleGuideName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleToggleRule = useCallback((ruleId: string) => {
    setStyleRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId ? { ...rule, checked: !rule.checked } : rule
      )
    );
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
    setSuggestions([]);

    const activeRules = styleRules.filter(rule => rule.checked);
    // Pass all rules, with their current checked status, to the action.
    // The AI flow will use the 'checked' property.
    const result = await checkTextAction(text, styleRules, customStyleGuideContent); 
    
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
          description: "No suggestions found based on the current style guide and rules.",
          variant: "default",
        });
      }
    }
    setIsLoading(false);
  }, [text, styleRules, customStyleGuideContent, toast]);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    toast({ description: "Suggestion dismissed." });
  }, [toast]);

  const handleUploadCustomStyleGuide = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target?.result as string;
      // For .txt or .md, we just take the content.
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        setCustomStyleGuideContent(fileText);
        setCustomStyleGuideName(file.name);
        toast({ title: "Custom style guide uploaded.", description: file.name });
      } else {
         toast({ 
           title: "Invalid File Type",
           description: "Please upload a .txt or .md file for the style guide.",
           variant: "destructive"
         });
      }
    };
    reader.onerror = () => {
      toast({ title: "Error reading style guide file.", variant: "destructive" });
    };
    reader.readAsText(file);
  }, [toast]);

  const handleRemoveCustomStyleGuide = useCallback(() => {
    setCustomStyleGuideContent(null);
    setCustomStyleGuideName(null);
    toast({ description: "Custom style guide removed. Using predefined rules and embedded guide principles." });
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
            onCheckText={handleCheckText}
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onDismissSuggestion={handleDismissSuggestion}
            styleRules={styleRules}
            onToggleRule={handleToggleRule}
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
