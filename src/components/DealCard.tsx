import React from 'react';

type Deal = {
  id: string;
  title: string;
  description: string;
  type: 'affiliate' | 'code' | 'in-store';
  actionLabel: string;
  actionUrl?: string;
  code?: string;
  imageUrl?: string;
  expiry?: string;
  provider: string;
  terms?: string;
  status: 'active' | 'expired' | 'pending';
};

interface DealCardProps {
  deal: Deal;
  onAction?: (deal: Deal) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onAction }) => {
  const handleAction = () => {
    if (deal.type === 'affiliate' && deal.actionUrl) {
      window.open(deal.actionUrl, '_blank');
    } else if (deal.type === 'code' && deal.code) {
      navigator.clipboard.writeText(deal.code);
      if (onAction) onAction(deal);
    } else if (onAction) {
      onAction(deal);
    }
  };

  return (
    <div className={`bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] overflow-hidden relative flex flex-col h-full group`}> 
      <div className="h-1 bg-gradient-to-r from-blue-400 to-pink-400 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300"></div>
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          {deal.imageUrl && <img src={deal.imageUrl} alt={deal.provider} className="w-10 h-10 rounded-full object-cover" />}
          <span className="font-bold text-gray-900 text-lg sm:text-xl flex-1 truncate">{deal.title}</span>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 flex-1 line-clamp-2">{deal.description}</p>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <span className="mr-2">By {deal.provider}</span>
          {deal.expiry && <span className="ml-auto">Expires: {deal.expiry}</span>}
        </div>
        {deal.type === 'code' && deal.code && (
          <div className="mb-2">
            <span className="inline-block bg-gray-200 px-2 py-1 rounded text-sm font-mono tracking-wider">{deal.code}</span>
          </div>
        )}
        <button
          onClick={handleAction}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-300 mt-auto shadow-lg hover:shadow-xl"
        >
          {deal.actionLabel}
        </button>
        {deal.terms && (
          <div className="mt-3 text-xs text-gray-400 italic">{deal.terms}</div>
        )}
      </div>
    </div>
  );
};

export default DealCard; 