
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Suggestion } from "@/types";
import { cn } from "@/lib/utils";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onDismiss: (suggestionId: string) => void;
  // onClick?: () => void; // Removed
}

export function SuggestionItem({ suggestion, onDismiss }: SuggestionItemProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border transition-all duration-300 ease-in-out hover:shadow-md"
        // onClick && "cursor-pointer hover:border-primary/50" // Styling for click removed
      )}
      // onClick, onKeyDown, tabIndex, role, aria-pressed removed
    >
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="flex-grow space-y-1">
          <p className="text-sm text-card-foreground">{suggestion.text}</p>
          {/* {suggestion.offendingText && ( // offendingText display removed
             <p className="text-xs text-muted-foreground italic truncate">
               Context: &ldquo;...{suggestion.offendingText.length > 50 ? suggestion.offendingText.substring(0, 47) + "..." : suggestion.offendingText}...&rdquo;
             </p>
          )} */}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            // e.stopPropagation(); // No longer needed as card is not clickable
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
