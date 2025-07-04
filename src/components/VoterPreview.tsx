import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Voter, AppSettings } from '@/types/voter';
import VoterCard from './VoterCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getSerialNumber, applyPhotosFirstSorting } from '@/utils/serialNumberHelper';

interface VoterPreviewProps {
  voters: Voter[];
  headerText: string;
  onEditVoter: (voter: Voter) => void;
  settings?: AppSettings;
}

const VOTERS_PER_PAGE = 20;
const VOTERS_PER_ROW = 2;

const VoterPreview: React.FC<VoterPreviewProps> = ({ 
  voters, 
  headerText, 
  onEditVoter, 
  settings 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const startSerial = settings?.startSerial || 1;

  // Photos-first sorting with search filtering
  const { sortedVoters, filteredVoters } = useMemo(() => {
    // First, sort by photos-first (this is our canonical order)
    const sorted = applyPhotosFirstSorting(voters);

    // Then apply search filter if there's a search term
    const filtered = searchTerm.trim()
      ? sorted.filter(v => v.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      : sorted;

    return { sortedVoters: sorted, filteredVoters: filtered };
  }, [voters, searchTerm]);

  const totalPages = Math.ceil(filteredVoters.length / VOTERS_PER_PAGE);

  // Sort voters in column-major order (same as PDF)
  const columnMajorVoters = useMemo(() => {
    const result: Voter[] = [];
    const rowsPerPage = VOTERS_PER_PAGE / VOTERS_PER_ROW;
    
    for (let page = 0; page < totalPages; page++) {
      const pageStart = page * VOTERS_PER_PAGE;
      const pageVoters = filteredVoters.slice(pageStart, pageStart + VOTERS_PER_PAGE);
      
      // Arrange in column-major order
      for (let row = 0; row < rowsPerPage; row++) {
        for (let col = 0; col < VOTERS_PER_ROW; col++) {
          const index = col * rowsPerPage + row;
          if (index < pageVoters.length) {
            result.push(pageVoters[index]);
          }
        }
      }
    }
    
    return result;
  }, [filteredVoters, totalPages]);

  const currentPageVoters = useMemo(() => {
    const startIndex = (currentPage - 1) * VOTERS_PER_PAGE;
    return columnMajorVoters.slice(startIndex, startIndex + VOTERS_PER_PAGE);
  }, [columnMajorVoters, currentPage]);

  // Reset to page 1 when search results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredVoters.length]);

  // Auto-scroll to first match when search results change
  React.useEffect(() => {
    if (searchTerm.trim() && filteredVoters.length > 0) {
      const element = document.getElementById('voter-preview');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchTerm, filteredVoters.length]);

  const handleSearchChange = (value: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing (200ms)
    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 200);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get the global index in the sorted list for consistent serial numbering
  const getGlobalIndex = (voter: Voter): number => {
    return sortedVoters.findIndex(v => v.id === voter.id);
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
          {rowVoters.map((voter, colIndex) => {
            const globalIndex = getGlobalIndex(voter);
            const serialNumber = getSerialNumber(globalIndex, startSerial);
            
            return (
              <div key={voter.id} className="flex-1">
                <VoterCard 
                  voter={voter} 
                  index={serialNumber - 1} // VoterCard expects 0-based for display
                  onEdit={onEditVoter}
                />
              </div>
            );
          })}
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
          
          {/* Search Bar */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Entry Number..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Showing {currentPageVoters.length} of {filteredVoters.length} voters 
            {searchTerm.trim() && ` (filtered from ${voters.length} total)`}
            {totalPages > 0 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>
        
        {filteredVoters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No voters found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
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
          </>
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
        
        {/* Search Bar */}
        <div className="flex justify-center mt-4 mb-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Entry Number..."
              className="pl-10"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Showing {currentPageVoters.length} of {filteredVoters.length} voters 
          {searchTerm.trim() && ` (filtered from ${voters.length} total)`}
          {totalPages > 0 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>
      
      {filteredVoters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No voters found matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="voter-preview">
            {currentPageVoters.map((voter) => {
              const globalIndex = getGlobalIndex(voter);
              const serialNumber = getSerialNumber(globalIndex, startSerial);
              
              return (
                <VoterCard 
                  key={voter.id}
                  voter={voter} 
                  index={serialNumber - 1} // VoterCard expects 0-based for display
                  onEdit={onEditVoter}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <PaginationComponent 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
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