/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

import { CasesListHeader } from "@/components/cases/CaseListHeader";
import { CasesFilters } from "@/components/cases/CasesFilter";
import { CasesTable } from "@/components/cases/CasesTable";
import { GridPagination } from "@/components/grid-parts/GridPagination";

export const CasesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // State
  const [cases, setCases] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Selection
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCases = async (cursor?: string | null, reset = false) => {
    setIsLoading(true);
    try {
      const params: any = {
        limit: 20,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        cursor: cursor || undefined,
      };

      const response = await api.get(`/cases`, { params });

      if (reset) {
        setCases(response.data.items);
        setSelectedCases([]); // Reset selection on filter change
      } else {
        setCases((prev) => [...prev, ...response.data.items]);
      }

      setTotalCount(response.data.total);
      setNextCursor(response.data.pagination.nextCursor);
      setHasMore(response.data.pagination.hasMore);
    } catch (error) {
      console.error("Failed to fetch cases", error);
      toast({
        title: "Error",
        description: "Failed to load cases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load & Filter Effects
  useEffect(() => {
    fetchCases(null, true);
  }, [statusFilter, categoryFilter]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases(null, true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    fetchCases(null, true);
  };

  const handleDeleteCase = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this case? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/cases/${id}`);
      setCases((prev) => prev.filter((c) => c.id !== id));
      setTotalCount((prev) => prev - 1);
      setSelectedCases((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
      toast({
        title: "Case Deleted",
        description: "The case has been permanently removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Could not delete case",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(cases.map((c) => c.id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleSelectCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedCases.length} cases? This cannot be undone.`
      )
    )
      return;

    try {
      await Promise.all(selectedCases.map((id) => api.delete(`/cases/${id}`)));
      setCases((prev) => prev.filter((c) => !selectedCases.includes(c.id)));
      setTotalCount((prev) => prev - selectedCases.length);
      setSelectedCases([]);
      toast({
        title: "Cases Deleted",
        description: "Selected cases have been removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: "Could not delete some cases.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  return (
    <div className="space-y-6">
      <CasesListHeader
        isAdmin={isAdmin}
        selectedCount={selectedCases.length}
        onDeleteSelected={handleDeleteSelected}
      />

      <CasesFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onSearch={handleSearch}
      />

      <GridPagination
        currentCount={cases.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={() => fetchCases(nextCursor)}
      />

      <CasesTable
        cases={cases}
        isLoading={isLoading}
        selectedCases={selectedCases}
        isAdmin={isAdmin}
        onSelectAll={handleSelectAll}
        onSelectCase={handleSelectCase}
        onDeleteCase={handleDeleteCase}
        onClearFilters={clearFilters}
        onViewDetails={(id) => navigate(`/cases/${id}`)}
      />

      {hasMore && (
        <GridPagination
          currentCount={cases.length}
          totalCount={totalCount}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={() => fetchCases(nextCursor)}
        />
      )}
    </div>
  );
};
