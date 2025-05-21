"use client";

import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EditorPanelProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function EditorPanel({ text, onTextChange }: EditorPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.type === "application/octet-stream" || // Added for robustness
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileText = e.target?.result as string;
          onTextChange(fileText);
          toast({ title: "File loaded successfully." });
        };
        reader.onerror = () => {
          toast({ title: "Error reading file.", variant: "destructive" });
        }
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid file type.",
          description: "Please upload a .txt or .md file.",
          variant: "destructive",
        });
      }
    }
    // Reset file input to allow uploading the same file again
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
          <Label htmlFor="text-input" className="sr-only">Enter or paste your text</Label>
          <Textarea
            id="text-input"
            placeholder="Paste your text here or upload a file..."
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={20}
            className="min-h-[300px] text-base resize-y"
          />
        </div>
        <Button onClick={handleUploadClick} variant="outline" className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Upload File (.txt, .md)
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.md,text/plain,text/markdown,application/octet-stream" // Made consistent with style guide uploader
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
