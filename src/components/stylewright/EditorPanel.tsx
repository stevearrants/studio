
"use client";

import React, { useRef } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EditorPanelProps {
  text: string;
  onTextChange: (text: string) => void;
  onCheckText: () => Promise<void>;
  isLoading: boolean;
  forwardedRef?: React.Ref<HTMLTextAreaElement>; // For forwarding the ref
}

const EditorPanel = React.forwardRef<HTMLTextAreaElement, EditorPanelProps>(
  ({ text, onTextChange, onCheckText, isLoading }, ref) => {
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
              ref={ref} // Assign the forwarded ref here
              placeholder="Paste your text here or upload a file..."
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={20}
              className="min-h-[300px] text-base resize-y"
            />
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
