import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, X, Upload, Trash2, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { parseMenu } from '@/utils/menuParser';

interface FileUploadProps {
  isDisabled: boolean;
  selectedServerId: string;
  selectedServerName: string;
}

export default function FileUpload({ isDisabled, selectedServerId, selectedServerName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingUpload, setExistingUpload] = useState<{ _id: string; serverId: string; serverName: string; fileUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE;
  const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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

  const fetchExistingUploads = useCallback(async () => {
    try {
      const token = localStorage.getItem('discord_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/uploads/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      const first = Array.isArray(data.uploads) && data.uploads.length > 0 ? data.uploads[0] : null;
      setExistingUpload(first || null);
    } catch (e) {
      console.error('Failed to fetch uploads', e);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchExistingUploads();
  }, [fetchExistingUploads]);

  const handleUpload = async () => {
    if (!uploadedFile) {
      alert("Please select an Excel file first.");
      return;
    }
    if (!selectedServerId || !selectedServerName) {
      alert("Please select a server first.");
      return;
    }
    if (existingUpload) {
      alert("You already have an upload. Remove it before uploading a new one.");
      return;
    }
    if (!CLOUDINARY_UPLOAD_PRESET) {
      alert("Missing Cloudinary upload preset configuration.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1) Convert XLSX to JSON using menuParser
      const parsed = await parseMenu(uploadedFile);
      const jsonString = JSON.stringify(parsed, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      // 2) Upload JSON to Cloudinary as a RAW asset
      const formData = new FormData();
      formData.append('file', jsonBlob, 'menu.json');
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const cloudinaryResp = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      if (!cloudinaryResp.ok) throw new Error('Cloudinary upload failed');
      const cloudinaryData = await cloudinaryResp.json();
      const fileUrl = cloudinaryData.secure_url || cloudinaryData.url;
      if (!fileUrl) throw new Error('No file URL returned by Cloudinary');

      // 3) Save mapping to backend
      const token = localStorage.getItem('discord_token');
      const saveResp = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ serverId: selectedServerId, serverName: selectedServerName, fileUrl }),
      });
      if (!saveResp.ok) {
        const errText = await saveResp.text();
        throw new Error(errText || 'Failed to save upload');
      }
      const saved = await saveResp.json();
      const first = Array.isArray(saved.uploads) && saved.uploads.length > 0 ? saved.uploads[0] : null;
      setExistingUpload(first || null);
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert('File uploaded successfully.');
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveExisting = async () => {
    if (!existingUpload) return;
    try {
      const token = localStorage.getItem('discord_token');
      const res = await fetch(`${API_BASE}/api/uploads/${existingUpload._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to remove');
      }
      const data = await res.json();
      const first = Array.isArray(data.uploads) && data.uploads.length > 0 ? data.uploads[0] : null;
      setExistingUpload(first || null);
      alert('Removed existing upload.');
    } catch (e) {
      console.error('Failed to remove upload', e);
      alert('Failed to remove upload.');
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
      
      <div className="mt-6 flex gap-3 items-center">
        <Button 
          onClick={handleUpload} 
          disabled={isDisabled || !uploadedFile || isProcessing || !!existingUpload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <CloudUpload className="h-4 w-4" />
          {isProcessing ? "Uploading..." : "Upload File"}
        </Button>
        {existingUpload && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <a href={existingUpload.fileUrl} target="_blank" rel="noreferrer" className="px-6 py-[9.5px] mr-1 font-medium bg-blue-300 text-white dark:bg-neutral-200 dark:text-black rounded-md">View current upload</a>
            <Button size="sm" className='dark:text-black text-white' variant="destructive" onClick={handleRemoveExisting}>
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}