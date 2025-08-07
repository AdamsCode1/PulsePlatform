import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Calendar, Users, Search, MapPin, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  created_at: string;
  society: {
    name: string;
    email: string;
  };
  rsvps?: {
    count: number;
  }[];
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventsPerPage] = useState(10);

  const fetchEvents = useCallback(async (page: number) => {
    setLoading(true);
    try {
      let query = supabase
        .from('event')
        .select(`
          *,
          society:society_id(name, contact_email)
        `, { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * eventsPerPage;
      const to = from + eventsPerPage - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setEvents(data || []);
      setTotalPages(Math.ceil((count || 0) / eventsPerPage));

    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventsPerPage, searchTerm, statusFilter, toast]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setUser(user);
      fetchEvents(currentPage);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    }
  }, [navigate, fetchEvents, currentPage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // This useEffect is to refetch data when filters change
  useEffect(() => {
    if (user) { // only fetch if user is authenticated
      fetchEvents(1); // Reset to page 1 when filters change
      if (currentPage !== 1) setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, user]); // Removed fetchEvents from dependencies to avoid loop

  useEffect(() => {
    // Check if we need to open review dialog from URL params
    const reviewId = searchParams.get('review');
    if (reviewId && events.length > 0) {
      const event = events.find(e => e.id === reviewId);
      if (event) {
        setSelectedEvent(event);
        setReviewDialog(true);
      }
    }
  }, [searchParams, events]);

  const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected', reason?: string) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ eventId, payload: { status, rejection_reason: reason } }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update event status.');
      }

      // Instead of just updating the local state, we refetch the current page
      // to ensure data consistency.
      fetchEvents(currentPage);

      toast({
        title: `Event ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `The event has been successfully ${status}.`,
      });

      setReviewDialog(false);
      setSelectedEvent(null);
      setRejectionReason('');

    } catch (error: any) {
      console.error(`Error ${status} event:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${status} event.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const approveEvent = (eventId: string) => {
    updateEventStatus(eventId, 'approved');
  };

  const rejectEvent = (eventId: string, reason: string) => {
    updateEventStatus(eventId, 'rejected', reason);
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

  const getEventStats = () => {
    const pending = events.filter(e => e.status === 'pending').length;
    const approved = events.filter(e => e.status === 'approved').length;
    const rejected = events.filter(e => e.status === 'rejected').length;
    return { pending, approved, rejected, total: events.length };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = getEventStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage all event submissions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events, societies, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">
                No events match your current search and filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {event.society.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Max {event.max_attendees}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Submitted on {new Date(event.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setReviewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>

                      {event.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveEvent(event.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedEvent(event);
                              setReviewDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {event.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/?event=${event.id}`, '_blank')}
                        >
                          View Public
                        </Button>
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

        {/* Review Dialog */}
        {selectedEvent && (
          <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Event: {selectedEvent.name}</DialogTitle>
                <DialogDescription>
                  Review the event details and approve or reject the submission.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Date & Time</h4>
                    <p className="text-gray-600">
                      {new Date(selectedEvent.start_time).toLocaleDateString()} at {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-gray-600">{selectedEvent.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Society</h4>
                    <p className="text-gray-600">{selectedEvent.society.name}</p>
                    <p className="text-sm text-gray-500">{selectedEvent.society.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Max Attendees</h4>
                    <p className="text-gray-600">
                      {selectedEvent.max_attendees == null ? "Not specified" : selectedEvent.max_attendees}
                    </p>
                  </div>
                </div>

                {selectedEvent.status === 'pending' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rejection Reason (optional)</h4>
                    <Textarea
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialog(false)} disabled={isUpdating}>
                  Close
                </Button>
                {selectedEvent.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => rejectEvent(selectedEvent.id, rejectionReason)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Rejecting...' : <><XCircle className="w-4 h-4 mr-2" />Reject</>}
                    </Button>
                    <Button onClick={() => approveEvent(selectedEvent.id)} disabled={isUpdating}>
                      {isUpdating ? 'Approving...' : <><CheckCircle className="w-4 h-4 mr-2" />Approve</>}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>

      <Footer />
    </div>
  );
}
