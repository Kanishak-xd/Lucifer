// src/components/FileUpload.tsx

import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, X, Upload, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMenu } from '@/utils/menuParser'; 

interface FileUploadProps {
  isDisabled: boolean;
}

export default function FileUpload({ isDisabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith('.xlsx'))) {
        setUploadedFile(file);
      }
    },
    [],
  );

  const handleSaveMenu = async () => {
    if (!uploadedFile) {
      alert("Please upload an Excel file first.");
      return;
    }

    setIsProcessing(true);
    try {
      const menu = await parseMenu(uploadedFile);
      
      const jsonString = JSON.stringify(menu, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'menu.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Menu saved successfully!");
    } catch (error) {
      console.error("Error processing menu:", error);
      alert("Error processing the Excel file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const fileName = uploadedFile?.name;

  return (
    <div className="mt-8">
      <div className={cn(
        "w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity",
        {
          "opacity-50 cursor-not-allowed pointer-events-none": isDisabled,
        }
      )}>
        <div className="space-y-2">
          <h3 className="text-lg font-medium dark:text-white">Excel File Upload</h3>
          <p className="text-sm text-muted-foreground">
            Supported formats: .xlsx
          </p>
        </div>

        <Input 
          type="file" 
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />

        {!uploadedFile ? (
          <div 
            onClick={handleThumbnailClick} 
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter} 
            onDragLeave={handleDragLeave} 
            onDrop={handleDrop}
            className={cn(
              "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              isDragging && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="rounded-full bg-background p-3 shadow-sm">
              <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium dark:text-white">Click to select</p>
              <p className="text-xs text-muted-foreground">
                or drag and drop file here
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="group relative h-64 overflow-hidden rounded-lg border bg-muted/50 flex flex-col items-center justify-center">
              <div className="rounded-full bg-background p-4 shadow-sm mb-4">
                <FileSpreadsheet className="h-12 w-12 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white mb-1">Excel File Ready</p>
                <p className="text-xs text-muted-foreground">{fileName}</p>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="secondary" onClick={handleThumbnailClick} className="h-9 w-9 p-0">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={handleRemove} className="h-9 w-9 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{fileName}</span>
                <button onClick={handleRemove} className="ml-auto rounded-full p-1 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex">
        <Button 
          onClick={handleSaveMenu} 
          disabled={isDisabled || !uploadedFile || isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isProcessing ? "Processing..." : "Save as JSON"}
        </Button>
      </div>
    </div>
  );
}