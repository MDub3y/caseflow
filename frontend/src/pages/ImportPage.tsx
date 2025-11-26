/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  ArrowRight,
  Upload,
  Loader2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MinusCircle,
  Plus,
  Trash,
} from "lucide-react";

import { CsvUploader } from "@/components/CsvUploader";
import { DataGrid } from "@/components/DataGrid";
import { ValidationPanel } from "@/components/ValidationPanel";
import { useCsvStore } from "@/store/csvStore";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    rows,
    fileName,
    setRawData,
    updateRow,
    getValidRows,
    clearData,
    addRow,
    deleteRow,
    deleteSelectedRows,
  } = useCsvStore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [submitResult, setSubmitResult] = useState<{
    created: any[];
    updated: any[];
    skipped: any[];
    failed: any[];
  } | null>(null);

  const handleFileUpload = (data: unknown[][], fileName: string) => {
    setRawData(data, fileName);
  };

  const handleCellEdit = React.useCallback(
    (id: string, field: string, val: string) => {
      const idx = parseInt(id);
      updateRow(idx, field, val);
    },
    [updateRow]
  );

  const handleSubmit = async () => {
    const validRows = getValidRows();
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      const CHUNK_SIZE = 100;
      const chunks = [];
      for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
        chunks.push(validRows.slice(i, i + CHUNK_SIZE));
      }

      const allCreated: any[] = [];
      const allUpdated: any[] = [];
      const allSkipped: any[] = [];
      const allFailed: any[] = [];

      const startRes = await api.post(`/imports/start`, {
        fileName: fileName || "manual-entry.csv",
        totalRows: validRows.length,
      });
      const importId = startRes.data.importId;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const casesData = chunk.map((row) => row.data);

        try {
          const response = await api.post(`/cases/batch`, {
            cases: casesData,
            importId,
          });

          if (response.data.created) allCreated.push(...response.data.created);
          if (response.data.updated) allUpdated.push(...response.data.updated);
          if (response.data.skipped) allSkipped.push(...response.data.skipped);
          if (response.data.failed) allFailed.push(...response.data.failed);

          setSubmitProgress(Math.round(((i + 1) / chunks.length) * 100));
        } catch (err) {
          allFailed.push(
            ...chunk.map((row) => ({
              row: row.data,
              errors: [`Network or Server Error: ${err}`],
            }))
          );
        }
      }

      setSubmitResult({
        created: allCreated,
        updated: allUpdated,
        skipped: allSkipped,
        failed: allFailed,
      });
      setShowResultDialog(true);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to start import process",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    if (submitResult?.failed.length === 0) {
      navigate("/cases");
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Upload or Start */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Step 1: Upload Data
          </h2>
          {rows.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearData}
              disabled={isSubmitting}
            >
              Clear & Start Over
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawData([], "manual-entry");
                addRow();
              }}
            >
              Start with Empty Table
            </Button>
          )}
        </div>
        {rows.length === 0 && <CsvUploader onFileUpload={handleFileUpload} />}
      </section>

      {/* Step 2: Validation & Grid */}
      {rows.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Step 2: Validate & Fix
            </h2>

            {/* ROW ACTIONS TOOLBAR */}
            <div className="flex items-center gap-2">
              {/* RBAC CHECK: Only render if role is explicitly ADMIN */}
              {user?.role === "ADMIN" && selectedIndices.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteSelectedRows(selectedIndices);
                    setSelectedIndices([]);
                    toast({
                      title: "Deleted",
                      description: `Removed ${selectedIndices.length} rows from the grid.`,
                    });
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedIndices.length})
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>

          <ValidationPanel />

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/50">
              <span className="font-medium text-sm text-foreground">
                File: {fileName}
              </span>
              <span className="text-xs text-muted-foreground">
                {rows.length} rows found
              </span>
            </div>

            <DataGrid
              rows={rows}
              onCellEdit={handleCellEdit}
              onDeleteRow={deleteRow}
              onSelectionChange={setSelectedIndices}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || getValidRows().length === 0}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing {submitProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit {getValidRows().length} Valid Cases
                </>
              )}
            </Button>
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <Progress value={submitProgress} />
              <p className="text-xs text-center text-muted-foreground">
                Do not close this window.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Results Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-3xl bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Import Complete
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Processing finished for {rows.length} rows.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4">
            {/* Created - Green */}
            <div className="flex flex-col items-center p-4 text-center border rounded-lg bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/50">
              <div className="p-2 mb-2 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {submitResult?.created.length || 0}
              </div>
              <div className="mt-1 text-xs font-medium uppercase text-green-800 dark:text-green-500">
                Added
              </div>
            </div>

            {/* Updated - Blue */}
            <div className="flex flex-col items-center p-4 text-center border rounded-lg bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50">
              <div className="p-2 mb-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {submitResult?.updated.length || 0}
              </div>
              <div className="mt-1 text-xs font-medium uppercase text-blue-800 dark:text-blue-500">
                Updated
              </div>
            </div>

            {/* Skipped - Gray */}
            <div className="flex flex-col items-center p-4 text-center border rounded-lg bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700/50">
              <div className="p-2 mb-2 rounded-full bg-gray-200 dark:bg-gray-700/50">
                <MinusCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                {submitResult?.skipped.length || 0}
              </div>
              <div className="mt-1 text-xs font-medium uppercase text-gray-800 dark:text-gray-500">
                Skipped
              </div>
            </div>

            {/* Failed - Red */}
            <div className="flex flex-col items-center p-4 text-center border rounded-lg bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50">
              <div className="p-2 mb-2 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {submitResult?.failed.length || 0}
              </div>
              <div className="mt-1 text-xs font-medium uppercase text-red-800 dark:text-red-500">
                Failed
              </div>
            </div>
          </div>

          {/* Error List */}
          {submitResult?.failed && submitResult.failed.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-foreground">
                Error Details
              </h4>
              <div className="p-3 overflow-y-auto border rounded-md max-h-[150px] bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-900/50 text-xs">
                {submitResult.failed.map((fail, i) => (
                  <div
                    key={i}
                    className="pb-2 mb-2 border-b last:border-0 border-red-100 text-red-700 dark:border-red-900 dark:text-red-300"
                  >
                    <div className="mb-1 font-mono opacity-80">
                      ID: {fail.row.case_id}
                    </div>
                    <span className="font-semibold">{fail.errors?.[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="secondary" onClick={handleCloseDialog}>
              Close
            </Button>
            <Button onClick={() => navigate("/cases")}>
              View Cases <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
