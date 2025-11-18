/**
 * Pagination Component
 */

import { cn } from '@shared/utils/helpers';
import './Pagination.css';

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <nav className={cn('pagination', className)}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="pagination-btn pagination-btn-nav"
      >
        이전
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'pagination-btn',
              currentPage === page ? 'pagination-btn-active' : 'pagination-btn-inactive'
            )}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-btn-nav"
      >
        다음
      </button>
    </nav>
  );
}

