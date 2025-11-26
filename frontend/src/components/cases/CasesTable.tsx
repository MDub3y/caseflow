/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { MoreHorizontal, FileSearch, XCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/grid-parts/StatusBadge";

interface CasesTableProps {
  cases: any[];
  isLoading: boolean;
  selectedCases: string[];
  isAdmin: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectCase: (id: string) => void;
  onDeleteCase: (id: string) => void;
  onClearFilters: () => void;
  onViewDetails: (id: string) => void;
}

export const CasesTable: React.FC<CasesTableProps> = ({
  cases,
  isLoading,
  selectedCases,
  isAdmin,
  onSelectAll,
  onSelectCase,
  onDeleteCase,
  onClearFilters,
  onViewDetails,
}) => {
  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "text-red-600 dark:text-red-400 font-bold";
    if (priority === "MEDIUM")
      return "text-yellow-600 dark:text-yellow-400 font-bold";
    return "text-green-600 dark:text-green-400 font-bold";
  };

  return (
    <Card className="bg-card border-border overflow-hidden min-h-[300px]">
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]">
                  <input
                    type="checkbox"
                    onChange={(e) => onSelectAll(e.target.checked)}
                    checked={
                      cases.length > 0 && selectedCases.length === cases.length
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]">
                  #
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Case ID
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Applicant
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Category
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Created
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-card-foreground">
              {isLoading && cases.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-4 w-4 bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-4 bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[100px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[150px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[80px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[60px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[80px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-[100px] bg-muted" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-8 w-8 rounded-full ml-auto bg-muted" />
                    </td>
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="bg-muted/50 p-4 rounded-full">
                        <FileSearch className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        No cases found
                      </h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        We couldn't find any cases matching your search
                        criteria. Try adjusting your filters or search term.
                      </p>
                      <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="mt-4"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((c, index) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "transition-colors",
                      "hover:bg-muted/50 dark:hover:bg-muted/20",
                      selectedCases.includes(c.id) &&
                        "bg-muted/40 dark:bg-muted/10"
                    )}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCases.includes(c.id)}
                        onChange={() => onSelectCase(c.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {index + 1}
                    </td>
                    <td className="p-4 font-medium">{c.caseId}</td>
                    <td className="p-4">{c.applicantName}</td>
                    <td className="p-4">{c.category}</td>
                    <td className="p-4 text-xs">
                      <span className={getPriorityColor(c.priority)}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} type="workflow" />
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(c.caseId)
                            }
                          >
                            Copy Case ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewDetails(c.id)}>
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteCase(c.id)}
                                className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete Case
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
