
import React from 'react';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EventFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
  currentFilter: string;
}

const EventFilters = ({ onFilterChange, currentFilter }: EventFiltersProps) => {
  const handleFilterSelect = (filterType: string, value: string) => {
    onFilterChange(filterType, value);
  };

  const getFilterLabel = () => {
    switch (currentFilter) {
      case 'attendees-desc':
        return 'Most Popular';
      case 'tech':
        return 'Tech';
      case 'art':
        return 'Art';
      default:
        return 'Filter';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          {getFilterLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleFilterSelect('sort', 'attendees-desc')}
          className="cursor-pointer"
        >
          Most Popular (Attendees)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Category</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleFilterSelect('category', 'tech')}
          className="cursor-pointer"
        >
          Tech
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleFilterSelect('category', 'art')}
          className="cursor-pointer"
        >
          Art
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleFilterSelect('category', 'all')}
          className="cursor-pointer"
        >
          All Categories
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventFilters;
