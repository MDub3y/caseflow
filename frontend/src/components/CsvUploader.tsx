import React, { useCallback, useState } from "react";
import Papa from "papaparse";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";

interface CsvUploaderProps {
  onFileUpload: (data: unknown[][], fileName: string) => void;
  maxSizeKB?: number;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onFileUpload,
  maxSizeKB = 10240,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(
    (file: File) => {
      setIsProcessing(true);

      // Validate file type
      if (!file.name.endsWith(".csv")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a CSV file",
        });
        setIsProcessing(false);
        return;
      }

      // Validate file size
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > maxSizeKB) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `File size exceeds ${maxSizeKB}KB limit`,
        });
        setIsProcessing(false);
        return;
      }

      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setUploadedFile(file);
            onFileUpload(results.data as unknown[][], file.name);
            toast({
              variant: "success",
              title: "File uploaded successfully",
              description: `Parsed ${results.data.length - 1} rows`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Empty file",
              description: "CSV file contains no data",
            });
          }
          setIsProcessing(false);
        },
        error: (error) => {
          toast({
            variant: "destructive",
            title: "Parse error",
            description: error.message,
          });
          setIsProcessing(false);
        },
      });
    },
    [onFileUpload, maxSizeKB, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const clearFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 cursor-pointer",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            isProcessing && "opacity-50 pointer-events-none"
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload CSV file"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById("file-input")?.click();
            }
          }}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            aria-label="Choose CSV file"
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          <p className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
            {isProcessing ? "Processing file..." : "Drop your CSV file here"}
          </p>

          <p className="text-sm text-gray-600 mb-4">or click to browse</p>

          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={isProcessing}
          >
            Select File
          </Button>

          <p className="mt-4 text-xs text-gray-500">
            Maximum file size: {Math.round(maxSizeKB / 1024)}MB
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
