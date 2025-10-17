import { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, X, Upload, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMenu } from '@/utils/menuParser.ts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a boolean to track if the selector should be disabled
  const isFileSelectorDisabled = !selectedServer;
  
  const { previewUrl, fileName, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove, } = useImageUpload({
    onUpload: (url) => {
      console.log("Uploaded file URL:", url);
      // Store the file for processing
      if (fileInputRef.current?.files?.[0]) {
        setUploadedFile(fileInputRef.current.files[0]);
      }
    },
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith('.xlsx'))) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileChange(fakeEvent)
      }
    },
    [handleFileChange],
  )


  const handleSaveMenu = async () => {
    if (!uploadedFile) {
      alert("Please upload an Excel file first.");
      return;
    }

    setIsProcessing(true);
    try {
      const menu = await parseMenu(uploadedFile);
      
      // Create and download JSON file
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

  return (
    <div className="flex justify-center">
      <div className="w-6xl h-screen">
        <h1 className="dark:text-white text-5xl font-bold pt-16">Menu Automation</h1>
        
        <div className="mt-8">
          <label className="dark:text-white block mb-3">Select a Server:</label>
          {user?.guilds && user.guilds.length > 0 ? (
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {user.guilds.map((guild) => (
                  <SelectItem key={guild.id} value={guild.id}>
                    {guild.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-gray-400">No servers found</p>
          )}
        </div>
        
        <div className="mt-8">
          {/* Apply conditional classes for the disabled state */}
          <div className={cn(
            "w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity",
            {
              "opacity-50 cursor-not-allowed pointer-events-none": isFileSelectorDisabled,
            }
          )}>
            <div className="space-y-2">
              <h3 className="text-lg font-medium dark:text-white">Excel File Upload</h3>
              <p className="text-sm text-muted-foreground">
                Supported formats: .xlsx
              </p>
            </div>

            <Input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden" ref={fileInputRef} onChange={handleFileChange}
            />

            {!previewUrl ? (
              <div onClick={handleThumbnailClick} onDragOver={handleDragOver}
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
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
          
          {/* Save Button */}
          <div className="mt-6 flex">
            {/* Also disable the save button if no server is selected */}
            <Button onClick={handleSaveMenu} disabled={isFileSelectorDisabled || !uploadedFile || isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Save as JSON"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}