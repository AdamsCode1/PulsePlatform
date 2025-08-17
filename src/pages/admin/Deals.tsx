import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { ShoppingBag, Search, DollarSign, Clock, CheckCircle, XCircle, Eye, Trash2, ExternalLink, Tag, Calendar } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  title: string;
  description: string;
  company_name: string;
  category: string;
  deal_type: 'affiliate' | 'code' | 'in-store';
  discount_percentage?: number;
  expires_at?: string;
  action_url?: string;
  promo_code?: string;
  terms_conditions?: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason?: string;
  partner: {
    name: string;
    contact_email: string;
  };
}

export default function AdminDeals() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dealsPerPage] = useState(10);

  const fetchDeals = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      // Use admin API endpoint instead of direct Supabase query
      const response = await fetch(`${API_BASE_URL}/api/admin/deals`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const result = await response.json();
      let deals = result.deals || [];

      // Apply client-side filtering for search and status
      if (statusFilter !== 'all') {
        deals = deals.filter((deal: Deal) => deal.status === statusFilter);
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        deals = deals.filter((deal: Deal) =>
          deal.title.toLowerCase().includes(searchLower) ||
          deal.description.toLowerCase().includes(searchLower) ||
          deal.company_name.toLowerCase().includes(searchLower)
        );
      }

      // Apply client-side pagination
      const totalDeals = deals.length;
      const from = (page - 1) * dealsPerPage;
      const to = from + dealsPerPage;
      const paginatedDeals = deals.slice(from, to);

      setDeals(paginatedDeals);
      setTotalPages(Math.ceil(totalDeals / dealsPerPage));

    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dealsPerPage, searchTerm, statusFilter, toast]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchDeals(currentPage);
    }
  }, [user, currentPage, searchTerm, statusFilter, fetchDeals]);

  const updateDealStatus = async (dealId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const payload: any = { status };
      if (status === 'rejected' && rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/deals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          dealId,
          payload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update deal status.');
      }

      // Refetch current page to ensure data consistency
      fetchDeals(currentPage);

      toast({
        title: status === 'approved' ? "Deal Approved" : "Deal Rejected",
        description: `The deal has been ${status}.`,
      });

    } catch (error: any) {
      console.error('Error updating deal status:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update deal status.',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setReviewDialog(false);
      setRejectionReason('');
    }
  };

  const approveDeal = (dealId: string) => {
    updateDealStatus(dealId, 'approved');
  };

  const rejectDeal = (dealId: string, reason: string) => {
    updateDealStatus(dealId, 'rejected', reason);
  };

  const deleteDeal = async (dealId: string) => {
    if (!window.confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/deals`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ dealId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete deal.');
      }

      // Refetch current page to ensure data consistency
      fetchDeals(currentPage);

      toast({
        title: "Deal Deleted",
        description: "The deal has been successfully deleted.",
      });

    } catch (error: any) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete deal.',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDealTypeDisplay = (type: string) => {
    switch (type) {
      case 'affiliate':
        return 'Affiliate Link';
      case 'code':
        return 'Promo Code';
      case 'in-store':
        return 'In-Store';
      default:
        return type;
    }
  };

  const getCategoryDisplay = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDealStats = () => {
    const pending = deals.filter(d => d.status === 'pending').length;
    const approved = deals.filter(d => d.status === 'approved').length;
    const rejected = deals.filter(d => d.status === 'rejected').length;
    return { pending, approved, rejected, total: deals.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner variant="page" size="lg" text="Loading deals dashboard..." />
      </div>
    );
  }

  const stats = getDealStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage all partner deal submissions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search deals by title, company, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Cards */}
        {deals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No deals have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{deal.title}</h3>
                        {getStatusBadge(deal.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{deal.description}</p>
                    </div>
                    {deal.image_url && (
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-20 h-20 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {deal.company_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      {getCategoryDisplay(deal.category)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {getDealTypeDisplay(deal.deal_type)}
                    </div>
                    {deal.discount_percentage && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {deal.discount_percentage}% off
                      </div>
                    )}
                  </div>

                  {deal.expires_at && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Expires: {new Date(deal.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Submitted by {deal.partner?.name || 'Unknown Partner'} on {new Date(deal.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setReviewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>

                      {deal.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveDeal(deal.id)}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setReviewDialog(true);
                            }}
                            disabled={isUpdating}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {deal.status === 'approved' && (
                        <>
                          {deal.action_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(deal.action_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Deal
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDeal(deal.id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(p => Math.max(1, p - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Deal: {selectedDeal?.title}</DialogTitle>
            <DialogDescription>
              Review the deal details and approve or reject the submission.
            </DialogDescription>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-6">
              {/* Deal Image */}
              {selectedDeal.image_url && (
                <div className="flex justify-center">
                  <img 
                    src={selectedDeal.image_url} 
                    alt={selectedDeal.title}
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Deal Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Company</h4>
                    <p className="text-gray-900">{selectedDeal.company_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Category</h4>
                    <p className="text-gray-900">{getCategoryDisplay(selectedDeal.category)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Deal Type</h4>
                    <p className="text-gray-900">{getDealTypeDisplay(selectedDeal.deal_type)}</p>
                  </div>
                  {selectedDeal.discount_percentage && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Discount</h4>
                      <p className="text-gray-900">{selectedDeal.discount_percentage}%</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Description</h4>
                  <p className="text-gray-900">{selectedDeal.description}</p>
                </div>

                {selectedDeal.promo_code && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Promo Code</h4>
                    <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{selectedDeal.promo_code}</p>
                  </div>
                )}

                {selectedDeal.action_url && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Action URL</h4>
                    <a 
                      href={selectedDeal.action_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {selectedDeal.action_url}
                    </a>
                  </div>
                )}

                {selectedDeal.expires_at && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Expires</h4>
                    <p className="text-gray-900">{new Date(selectedDeal.expires_at).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedDeal.terms_conditions && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Terms & Conditions</h4>
                    <p className="text-gray-900 text-sm">{selectedDeal.terms_conditions}</p>
                  </div>
                )}

                {selectedDeal.status === 'rejected' && selectedDeal.rejection_reason && (
                  <div>
                    <h4 className="font-semibold text-sm text-red-600">Rejection Reason</h4>
                    <p className="text-red-900 bg-red-50 p-3 rounded">{selectedDeal.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason Input */}
              {selectedDeal.status === 'pending' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (optional)
                  </label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialog(false);
                setRejectionReason('');
              }}
            >
              Close
            </Button>
            
            {selectedDeal?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedDeal) {
                      rejectDeal(selectedDeal.id, rejectionReason);
                    }
                  }}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Deal
                </Button>
                <Button
                  onClick={() => {
                    if (selectedDeal) {
                      approveDeal(selectedDeal.id);
                    }
                  }}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Deal
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
