import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GridPaginationProps {
  currentCount: number;
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const GridPagination: React.FC<GridPaginationProps> = ({
  currentCount,
  totalCount,
  hasMore,
  isLoading,
  onLoadMore,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      {currentCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{currentCount}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          cases
        </div>
      )}

      {hasMore && (
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoading}
          className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground w-full max-w-xs"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Load More
        </Button>
      )}
    </div>
  );
};
