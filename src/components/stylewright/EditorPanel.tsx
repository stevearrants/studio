
"use client";

import React, { useRef } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { CheckMode } from "@/types";

interface EditorPanelProps {
  text: string;
  onTextChange: (text: string) => void;
  onCheckText: () => Promise<void>;
  isLoading: boolean;
  currentCheckMode: CheckMode;
  onCheckModeChange: (mode: CheckMode) => void;
}

const EditorPanel = React.forwardRef<HTMLTextAreaElement, EditorPanelProps>(
  ({ text, onTextChange, onCheckText, isLoading, currentCheckMode, onCheckModeChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const isTxt = file.name.endsWith(".txt");
        const isMd = file.name.endsWith(".md");

        if (isTxt || isMd) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileText = e.target?.result as string;
            onTextChange(fileText);
            toast({ title: "File loaded successfully." });
          };
          reader.onerror = () => {
            toast({ title: "Error reading file.", variant: "destructive" });
          };
          reader.readAsText(file);
        } else {
          toast({
            title: "Invalid file type.",
            description: "Please upload a .txt or .md file.",
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

    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Your Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="text-input" className="sr-only">
              Enter or paste your text
            </Label>
            <Textarea
              id="text-input"
              ref={ref}
              placeholder="Paste your text here or upload a file..."
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={18} // Adjusted rows to make space for radio buttons
              className="min-h-[250px] text-base resize-y"
            />
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="check-mode-group" className="text-sm font-medium">Check Options:</Label>
              <RadioGroup
                id="check-mode-group"
                value={currentCheckMode}
                onValueChange={(value) => onCheckModeChange(value as CheckMode)}
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spell_grammar_only" id="spell_grammar_only" />
                  <Label htmlFor="spell_grammar_only" className="font-normal">Spelling &amp; Grammar only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="style_guide_check" id="style_guide_check" />
                  <Label htmlFor="style_guide_check" className="font-normal">Style Guide, Spelling &amp; Grammar</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File (.txt, .md)
              </Button>
              <Button
                onClick={onCheckText}
                disabled={isLoading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Check Text
              </Button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md"
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  }
);

EditorPanel.displayName = "EditorPanel";
export { EditorPanel };
