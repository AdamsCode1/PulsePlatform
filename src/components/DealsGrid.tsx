import React from 'react';
import DealCard from './DealCard';
import { mockDeals } from '../data/mockDeals';

const DealsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl w-full mx-auto">
      {mockDeals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

export default DealsGrid; 