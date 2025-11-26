import React from "react";
import { AlertCircle, CheckCircle, Wand2 } from "lucide-react";
import { useCsvStore } from "@/store/csvStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const ValidationPanel: React.FC = () => {
  const {
    rows,
    getValidRows,
    getInvalidRows,
    fixAllRows,
    validateRows,
    isValidating,
    validationProgress,
  } = useCsvStore();

  const validCount = getValidRows().length;
  const invalidCount = getInvalidRows().length;
  const totalCount = rows.length;

  const handleFixAll = () => {
    fixAllRows();
  };

  const handleValidate = () => {
    validateRows();
  };

  if (totalCount === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Validation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Rows */}
          <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </div>

          {/* Valid */}
          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-500/10 dark:border-green-500/20">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-5 w-5 mr-1 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {validCount}
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-500">Valid</p>
          </div>

          {/* Invalid */}
          <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-5 w-5 mr-1 text-red-600 dark:text-red-400" />
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {invalidCount}
              </p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-500">Invalid</p>
          </div>
        </div>

        {isValidating && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Validating...
              </span>
              <span className="text-sm font-medium text-foreground">
                {validationProgress}%
              </span>
            </div>
            <Progress
              value={validationProgress}
              aria-label="Validation progress"
              className="h-2"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isValidating}
            className="flex-1 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Validate All
          </Button>

          <Button
            variant="default"
            onClick={handleFixAll}
            disabled={isValidating || invalidCount === 0}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Fix All
          </Button>
        </div>

        {invalidCount > 0 && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Tip:</strong> "Fix All" will trim whitespace, normalize
              phone numbers, title-case names, and set default values where
              possible.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
