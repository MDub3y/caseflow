import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CasesFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export const CasesFilters: React.FC<CasesFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onSearch,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-card p-4 rounded-lg border border-border shadow-sm">
      <div className="flex-1 w-full">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Search
        </label>
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Name, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background text-foreground border-input focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Search
          </Button>
        </form>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-background text-foreground border-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Category
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-background text-foreground border-input">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="TAX">Tax</SelectItem>
              <SelectItem value="LICENSE">License</SelectItem>
              <SelectItem value="PERMIT">Permit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
