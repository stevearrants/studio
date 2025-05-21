
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Upload, XCircle, FileText } from "lucide-react"; 
import type { Suggestion } from "@/types";
import { SuggestionItem } from "./SuggestionItem";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface ControlsAndSuggestionsPanelProps {
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
  onCheckText,
  suggestions,
  isLoading,
  error,
  onDismissSuggestion,
  customStyleGuideName,
  onUploadCustomStyleGuide,
  onRemoveCustomStyleGuide,
}: ControlsAndSuggestionsPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md") ||
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        // Fallback for when browser doesn't set type correctly but extension is .txt or .md
        (file.type === "application/octet-stream" && (file.name.endsWith(".txt") || file.name.endsWith(".md")))
      ) {
        onUploadCustomStyleGuide(file);
      } else {
        toast({
          title: "Invalid file type for Vale style guide.",
          description: "Please upload a .txt or .md file with Vale-compatible YAML content.",
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
          <CardTitle className="text-xl">Custom Vale Style Guide (Optional)</CardTitle>
          <CardDescription>
            Upload your own Vale-compatible style guide (as a .txt or .md file).
            The content of the file must be YAML. If no custom guide is uploaded, the default embedded Vale guide is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customStyleGuideName ? (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{customStyleGuideName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onRemoveCustomStyleGuide} aria-label="Remove custom style guide">
                <XCircle className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleUploadClick} variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Vale Guide (.txt, .md)
            </Button>
          )}
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,text/plain,text/markdown,application/octet-stream"
            className="hidden"
          />
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
