"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Suggestion } from "@/types";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onDismiss: (suggestionId: string) => void;
}

export function SuggestionItem({ suggestion, onDismiss }: SuggestionItemProps) {
  return (
    <Card className="bg-card border-border transition-all duration-300 ease-in-out hover:shadow-md">
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <p className="text-sm text-card-foreground flex-grow">{suggestion.text}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDismiss(suggestion.id)}
          className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
          aria-label="Dismiss suggestion"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
