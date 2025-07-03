import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Voter } from '@/types/voter';
import VoterCard from './VoterCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface VoterPreviewProps {
  voters: Voter[];
  headerText: string;
  onEditVoter: (voter: Voter) => void;
}

const VOTERS_PER_PAGE = 20;
const VOTERS_PER_ROW = 2;

const VoterPreview: React.FC<VoterPreviewProps> = ({ voters, headerText, onEditVoter }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(voters.length / VOTERS_PER_PAGE);

  // Sort voters in column-major order (same as PDF)
  const sortedVoters = useMemo(() => {
    const sorted: Voter[] = [];
    const rowsPerPage = VOTERS_PER_PAGE / VOTERS_PER_ROW;
    
    for (let page = 0; page < totalPages; page++) {
      const pageStart = page * VOTERS_PER_PAGE;
      const pageVoters = voters.slice(pageStart, pageStart + VOTERS_PER_PAGE);
      
      // Arrange in column-major order
      for (let row = 0; row < rowsPerPage; row++) {
        for (let col = 0; col < VOTERS_PER_ROW; col++) {
          const index = col * rowsPerPage + row;
          if (index < pageVoters.length) {
            sorted.push(pageVoters[index]);
          }
        }
      }
    }
    
    return sorted;
  }, [voters, totalPages]);

  const currentPageVoters = useMemo(() => {
    const startIndex = (currentPage - 1) * VOTERS_PER_PAGE;
    return sortedVoters.slice(startIndex, startIndex + VOTERS_PER_PAGE);
  }, [sortedVoters, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (voters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No voters added yet
        </p>
      </div>
    );
  }

  // For large datasets, use virtualization
  if (voters.length > 1000) {
    const VirtualizedRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const rowStartIndex = index * VOTERS_PER_ROW;
      const rowVoters = currentPageVoters.slice(rowStartIndex, rowStartIndex + VOTERS_PER_ROW);
      
      return (
        <div style={style} className="flex gap-4 px-4">
          {rowVoters.map((voter, colIndex) => (
            <div key={voter.id} className="flex-1">
              <VoterCard 
                voter={voter} 
                index={rowStartIndex + colIndex} 
                onEdit={onEditVoter}
              />
            </div>
          ))}
        </div>
      );
    };

    const rowCount = Math.ceil(currentPageVoters.length / VOTERS_PER_ROW);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {headerText}
          </h2>
          <p className="text-lg text-gray-700">Members List</p>
          <p className="text-sm text-gray-500">
            Showing {currentPageVoters.length} of {voters.length} voters (Page {currentPage} of {totalPages})
          </p>
        </div>
        
        <div className="border rounded-lg">
          <List
            height={600}
            itemCount={rowCount}
            itemSize={200}
            width="100%"
          >
            {VirtualizedRow}
          </List>
        </div>

        {totalPages > 1 && (
          <PaginationComponent 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  }

  // For smaller datasets, use regular rendering
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {headerText}
        </h2>
        <p className="text-lg text-gray-700">Members List</p>
        <p className="text-sm text-gray-500">
          Showing {currentPageVoters.length} of {voters.length} voters (Page {currentPage} of {totalPages})
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="voter-preview">
        {currentPageVoters.map((voter, index) => (
          <VoterCard 
            key={voter.id} 
            voter={voter} 
            index={(currentPage - 1) * VOTERS_PER_PAGE + index} 
            onEdit={onEditVoter}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationComponent 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <Pagination className="justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        
        {getVisiblePages().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <span className="px-3 py-2">...</span>
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default VoterPreview;