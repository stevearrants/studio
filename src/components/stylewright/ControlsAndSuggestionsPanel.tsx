"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Upload, XCircle, FileText } from "lucide-react";
import type { StyleRule, Suggestion } from "@/types";
import { SuggestionItem } from "./SuggestionItem";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ControlsAndSuggestionsPanelProps {
  styleRules: StyleRule[];
  selectedRules: string[];
  onSelectedRulesChange: (ruleId: string, checked: boolean) => void;
  onCheckText: () => Promise<void>;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  onDismissSuggestion: (suggestionId: string) => void;
  customStyleGuideName: string | null;
  onUploadCustomStyleGuide: (file: File) => void;
  onRemoveCustomStyleGuide: () => void;
}

export function ControlsAndSuggestionsPanel({
  styleRules,
  selectedRules,
  onSelectedRulesChange,
  onCheckText,
  suggestions,
  isLoading,
  error,
  onDismissSuggestion,
  customStyleGuideName,
  onUploadCustomStyleGuide,
  onRemoveCustomStyleGuide,
}: ControlsAndSuggestionsPanelProps) {
  const customStyleGuideInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCustomStyleGuideFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadCustomStyleGuide(file);
    }
    if (customStyleGuideInputRef.current) {
      customStyleGuideInputRef.current.value = "";
    }
  };

  const handleUploadCustomStyleGuideClick = () => {
    customStyleGuideInputRef.current?.click();
  };
  
  const canCheckText = selectedRules.length > 0 || !!customStyleGuideName;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Style Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customStyleGuideName ? (
            <div className="p-3 border rounded-md bg-secondary/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Using: {customStyleGuideName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemoveCustomStyleGuide} className="text-destructive hover:text-destructive/80">
                  <XCircle className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
               <p className="text-xs text-muted-foreground mt-1">
                The predefined rules below will act as areas of focus within your custom guide.
              </p>
            </div>
          ) : (
            <Button onClick={handleUploadCustomStyleGuideClick} variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Custom Style Guide (.txt, .md)
            </Button>
          )}
          <input
            type="file"
            ref={customStyleGuideInputRef}
            onChange={handleCustomStyleGuideFileChange}
            accept=".txt,.md,text/plain,text/markdown,application/octet-stream"
            className="hidden"
          />
          <Separator />
          <CardDescription>
            {customStyleGuideName ? "Predefined rules (focus areas):" : "Or, select predefined rules:"}
          </CardDescription>
          <ScrollArea className="h-[180px] pr-3">
            <div className="space-y-3">
              {styleRules.map((rule) => (
                <div key={rule.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={rule.id}
                    checked={selectedRules.includes(rule.id)}
                    onCheckedChange={(checked) =>
                      onSelectedRulesChange(rule.id, !!checked)
                    }
                    aria-labelledby={`${rule.id}-label`}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={rule.id} id={`${rule.id}-label`} className="font-medium cursor-pointer">
                      {rule.label}
                    </Label>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
            <ScrollArea className="h-[250px] pr-1"> {/* Adjusted height */}
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
