
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Suggestion } from "@/types";
import { cn } from "@/lib/utils";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onDismiss: (suggestionId: string) => void;
  onClick?: () => void; // Optional onClick handler
}

export function SuggestionItem({ suggestion, onDismiss, onClick }: SuggestionItemProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border transition-all duration-300 ease-in-out hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={onClick} // Apply onClick to the Card
      onKeyDown={(e) => { // Allow keyboard activation
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1} // Make it focusable if clickable
      role={onClick ? "button" : undefined}
      aria-pressed={onClick ? false : undefined} // Semantics for a button-like card
    >
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <p className="text-sm text-card-foreground flex-grow">{suggestion.text}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent Card's onClick when dismissing
            onDismiss(suggestion.id);
          }}
          className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
          aria-label="Dismiss suggestion"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
