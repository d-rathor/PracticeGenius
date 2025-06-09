import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
}

/**
 * Custom hook for handling pagination
 * @param options Pagination options
 * @returns Pagination state and handlers
 */
export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0
}: PaginationOptions = {}) {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [total, setTotal] = useState<number>(totalItems);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  /**
   * Go to specific page
   * @param pageNumber Page number to go to
   */
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  }, [totalPages]);

  /**
   * Change items per page
   * @param newLimit New items per page limit
   */
  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  /**
   * Update total items count
   * @param count New total items count
   */
  const updateTotal = useCallback((count: number) => {
    setTotal(count);
    
    // If current page is now invalid, adjust it
    if (count > 0) {
      const newTotalPages = Math.ceil(count / limit);
      if (page > newTotalPages) {
        setPage(newTotalPages);
      }
    } else {
      setPage(1);
    }
  }, [limit, page]);

  /**
   * Reset pagination to initial state
   */
  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  // Offset is already calculated above

  // Calculate offset for API queries
  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  // Generate page numbers array for pagination UI
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and pages around current page
      if (page <= 3) {
        // Near beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Separator
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push(-1); // Separator
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push(-1); // Separator
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push(-1); // Separator
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [page, totalPages]);

  return {
    page,
    limit,
    total,
    totalPages,
    offset,
    pageNumbers,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    updateTotal,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

export default usePagination;
