import React from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;
  // Convert string to number if needed, since URL query params might make it a string.
  const currentPage = Number(page);

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default Pagination;
