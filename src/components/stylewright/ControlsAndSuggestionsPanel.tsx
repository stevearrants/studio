
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Upload, XCircle, FileText, Settings2 } from "lucide-react"; 
import type { Suggestion, StyleRule } from "@/types";
import { SuggestionItem } from "./SuggestionItem";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ControlsAndSuggestionsPanelProps {
  onCheckText: () => Promise<void>;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  onDismissSuggestion: (suggestionId: string) => void;
  styleRules: StyleRule[];
  onToggleRule: (ruleId: string) => void;
  customStyleGuideName: string | null;
  onUploadCustomStyleGuide: (file: File) => void;
  onRemoveCustomStyleGuide: () => void;
}

export function ControlsAndSuggestionsPanel({
  onCheckText,
  suggestions,
  isLoading,
  error,
  onDismissSuggestion,
  styleRules,
  onToggleRule,
  customStyleGuideName,
  onUploadCustomStyleGuide,
  onRemoveCustomStyleGuide,
}: ControlsAndSuggestionsPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        onUploadCustomStyleGuide(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .txt or .md file for the style guide.",
          variant: "destructive",
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const canCheckText = true; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Settings2 className="mr-2 h-5 w-5 text-primary" />
            Style Configuration
          </CardTitle>
          <CardDescription>
            Select predefined rules to focus on, or upload your own style guide. 
            If a custom guide is uploaded, these rules act as hints for the AI within that guide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Predefined Rules:</h4>
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {styleRules.map((rule) => (
                  <Tooltip key={rule.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={rule.id}
                          checked={rule.checked}
                          onCheckedChange={() => onToggleRule(rule.id)}
                          aria-labelledby={`${rule.id}-label`}
                        />
                        <Label
                          htmlFor={rule.id}
                          id={`${rule.id}-label`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {rule.label}
                        </Label>
                      </div>
                    </TooltipTrigger>
                    {rule.description && (
                      <TooltipContent side="top" align="start">
                        <p>{rule.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
          <Separator />
           <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom Style Guide (.txt, .md):</h4>
            {customStyleGuideName ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate" title={customStyleGuideName}>{customStyleGuideName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onRemoveCustomStyleGuide} aria-label="Remove custom style guide">
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleUploadClick} variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Custom Guide
              </Button>
            )}
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md"
              className="hidden"
            />
          </div>
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
            <ScrollArea className="h-[250px] pr-1">
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
