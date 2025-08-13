
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
      case 'all':
        return 'All Categories';
      case 'academic':
        return 'Academic';
      case 'associations':
        return 'Associations';
      case 'cultural and faith':
        return 'Cultural and Faith';
      case 'fundraising':
        return 'Fundraising';
      case 'interests':
        return 'Interests';
      case 'media':
        return 'Media';
      case 'music':
        return 'Music';
      case 'political and causes':
        return 'Political and Causes';
      case 'professional development':
        return 'Professional Development';
      case 'social':
        return 'Social';
      case 'sport':
        return 'Sport';
      case 'theatre':
        return 'Theatre';
      case 'general':
        return 'General';
      default:
        return 'Filter';
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          {getFilterLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-white border border-gray-200 shadow-lg max-h-80 overflow-y-auto"
        onCloseAutoFocus={(event) => event.preventDefault()}
        side="bottom"
        align="end"
      >
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
          onClick={() => handleFilterSelect('category', 'all')}
          className="cursor-pointer"
        >
          All Categories
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'academic')}
          className="cursor-pointer"
        >
          Academic
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'associations')}
          className="cursor-pointer"
        >
          Associations
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'cultural and faith')}
          className="cursor-pointer"
        >
          Cultural and Faith
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'fundraising')}
          className="cursor-pointer"
        >
          Fundraising
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'general')}
          className="cursor-pointer"
        >
          General
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'interests')}
          className="cursor-pointer"
        >
          Interests
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'media')}
          className="cursor-pointer"
        >
          Media
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'music')}
          className="cursor-pointer"
        >
          Music
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'political and causes')}
          className="cursor-pointer"
        >
          Political and Causes
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'professional development')}
          className="cursor-pointer"
        >
          Professional Development
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'social')}
          className="cursor-pointer"
        >
          Social
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'sport')}
          className="cursor-pointer"
        >
          Sport
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterSelect('category', 'theatre')}
          className="cursor-pointer"
        >
          Theatre
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventFilters;
