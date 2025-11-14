/**
 * Pagination Hook
 */

import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@shared/utils/constants';

export function usePagination(initialPage = 1, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const goToPage = (newPage) => {
    setPage(newPage);
  };
  
  const nextPage = () => {
    setPage(prev => prev + 1);
  };
  
  const prevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };
  
  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };
  
  const reset = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  };
  
  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset
  };
}

