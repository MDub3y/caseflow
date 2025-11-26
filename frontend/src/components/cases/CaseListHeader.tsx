import React from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface CasesListHeaderProps {
  isAdmin: boolean;
  selectedCount: number;
  onDeleteSelected: () => void;
}

export const CasesListHeader: React.FC<CasesListHeaderProps> = ({
  isAdmin,
  selectedCount,
  onDeleteSelected,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Cases
        </h2>
        <p className="text-muted-foreground">
          Manage and track all submitted cases from here.
        </p>
      </div>
      {isAdmin && selectedCount > 0 && (
        <Button variant="destructive" onClick={onDeleteSelected}>
          <Trash className="mr-2 h-4 w-4" /> Delete Selected ({selectedCount})
        </Button>
      )}
    </div>
  );
};
