"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
  showPageNumbers?: boolean;
  totalPages?: number;
}

export function Pagination({
  page,
  hasMore,
  onPageChange,
  isLoading = false,
  className = "",
  showPageNumbers = false,
  totalPages,
}: PaginationProps) {
  // Don't show pagination if on first page and no more pages
  if (page === 1 && !hasMore) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasMore) {
      onPageChange(page + 1);
    }
  };

  return (
    <div
      className={`flex justify-center items-center gap-2 sm:gap-4 ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={page === 1 || isLoading}
        className="gap-1 sm:gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>

      {showPageNumbers && totalPages ? (
        <div className="flex items-center gap-1">
          {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
            pageNum === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={isLoading}
                className="w-9 h-9 p-0"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground px-2">
          Halaman {page}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!hasMore || isLoading}
        className="gap-1 sm:gap-2"
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const delta = 1; // Number of pages to show on each side of current page

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push("...");
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
