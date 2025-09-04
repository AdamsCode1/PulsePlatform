import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Copy, ExternalLink, Clock, MapPin, Tag, Heart, Share, CheckCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface Deal {
  id: string;
  title: string;
  description: string;
  businessName: string;
  imageUrl?: string;
  expiryDate: string;
  code?: string;
  link?: string;
  category: string;
  discount?: string;
  terms?: string;
  location?: string;
}

interface EnhancedDealsGridProps {
  deals?: Deal[];
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: '20% Off Student Utilities',
    description: 'Get 20% off your first month with Student Utilities Co. via our exclusive affiliate link.',
    businessName: 'Student Utilities Co.',
    imageUrl: '/placeholder.svg',
    expiryDate: '2024-12-31',
    link: 'https://example.com',
    category: 'Utilities',
    discount: '20%',
    terms: 'Valid for new customers only. See website for full terms.',
    location: 'Online'
  },
  {
    id: '2',
    title: 'Free Coffee at Campus Cafe',
    description: 'Show your student ID and this code to get a free coffee at Campus Cafe.',
    businessName: 'Campus Cafe',
    imageUrl: '/placeholder.svg',
    expiryDate: '2024-10-01',
    code: 'FREESTUDENTCOFFEE',
    category: 'Food & Drink',
    discount: 'Free Item',
    terms: 'One per student. Valid until stocks last.',
    location: 'Durham City Centre'
  },
  {
    id: '3',
    title: '10% Off In-Store at Bookshop',
    description: 'Get 10% off all books in-store. Just show your student card at checkout.',
    businessName: 'Durham Bookshop',
    imageUrl: '/placeholder.svg',
    expiryDate: '2024-09-15',
    category: 'Education',
    discount: '10%',
    terms: 'Student ID required. Not valid with other offers.',
    location: 'Durham'
  },
];

const EnhancedDealsGrid = ({ deals = mockDeals }: EnhancedDealsGridProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

  const handleCopyCode = (code: string, dealId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodes(prev => new Set([...prev, dealId]));
    
    toast({
      title: "Code Copied!",
      description: `${code} copied to clipboard`,
    });

    // Reset after 3 seconds
    setTimeout(() => {
      setCopiedCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(dealId);
        return newSet;
      });
    }, 3000);
  };

  const handleFavorite = (dealId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(dealId)) {
        newFavorites.delete(dealId);
        toast({ title: "Removed from favorites" });
      } else {
        newFavorites.add(dealId);
        toast({ title: "Added to favorites" });
      }
      return newFavorites;
    });
  };

  const handleShare = (deal: Deal) => {
    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: deal.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${deal.title} - ${deal.description} ${window.location.href}`);
      toast({
        title: "Deal shared!",
        description: "Deal details copied to clipboard",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food & Drink': 'bg-orange-100 text-orange-700',
      'Utilities': 'bg-blue-100 text-blue-700',
      'Education': 'bg-green-100 text-green-700',
      'Entertainment': 'bg-purple-100 text-purple-700',
      'Shopping': 'bg-pink-100 text-pink-700',
      'Transport': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <Card 
          key={deal.id} 
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-purple-50/20 backdrop-blur-sm"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Expiry Warning */}
          {isExpiringSoon(deal.expiryDate) && (
            <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white border-0 shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Expiring Soon
            </Badge>
          )}

          <CardContent className="p-6 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs px-2 py-1 ${getCategoryColor(deal.category)}`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {deal.category}
                  </Badge>
                  {deal.discount && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      {deal.discount} OFF
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                  {deal.title}
                </h3>
                <p className="text-sm text-purple-600 font-medium">{deal.businessName}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-2 hover:bg-purple-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(deal.id);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(deal.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-2 hover:bg-purple-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(deal);
                  }}
                >
                  <Share className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">
              {deal.description}
            </p>

            {/* Details */}
            <div className="space-y-2 mb-6">
              {deal.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="text-sm">{deal.location}</span>
                </div>
              )}
              <div className="flex items-center text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm">
                  Expires: {new Date(deal.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Code Section */}
            {deal.code && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-dashed border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-bold text-gray-900">
                    {deal.code}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`transition-all duration-200 ${
                      copiedCodes.has(deal.id)
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'hover:bg-purple-50 border-purple-200 text-purple-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(deal.code!, deal.id);
                    }}
                  >
                    {copiedCodes.has(deal.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-between items-center">
              {deal.link ? (
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(deal.link, '_blank');
                  }}
                >
                  Get Deal
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  Show Details
                </Button>
              )}
              
              {/* Terms */}
              {deal.terms && (
                <div className="text-xs text-gray-500 max-w-xs truncate">
                  {deal.terms}
                </div>
              )}
            </div>
          </CardContent>

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ padding: '1px' }}>
            <div className="w-full h-full rounded-lg bg-white" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedDealsGrid;
