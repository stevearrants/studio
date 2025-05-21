
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"; 
import type { Suggestion } from "@/types";
import { SuggestionItem } from "./SuggestionItem";
import { Separator } from "@/components/ui/separator";

interface ControlsAndSuggestionsPanelProps {
  onCheckText: () => Promise<void>;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  onDismissSuggestion: (suggestionId: string) => void;
}

export function ControlsAndSuggestionsPanel({
  onCheckText,
  suggestions,
  isLoading,
  error,
  onDismissSuggestion,
}: ControlsAndSuggestionsPanelProps) {
  
  const canCheckText = true; 

  return (
    <div className="space-y-6">
      <Button onClick={onCheckText} disabled={isLoading || !canCheckText} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Check Text
      </Button>
      
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading suggestions...</span>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && suggestions.length === 0 && (
             <p className="text-sm text-center text-muted-foreground py-4">
              No suggestions yet. Enter text and click "Check Text" to see suggestions.
            </p>
          )}
          {!isLoading && !error && suggestions.length > 0 && (
            <ScrollArea className="h-[300px] sm:h-[350px] md:h-[400px] pr-1"> {/* Increased height slightly */}
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    onDismiss={onDismissSuggestion}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
