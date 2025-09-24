import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Calendar, Users, Search, MapPin, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from '@/hooks/useDebounce';
import { RRule } from 'rrule';

// Using shared HMR-safe Supabase client from lib/supabaseClient

interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string; // UUID
  locations?: {
    name: string;
    formatted_address: string;
  };
  max_attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  created_at: string;
  society: {
    name: string;
    contact_email: string;
  };
  rsvp?: {
    count: number;
  }[];
  rrule?: string; // Recurrence rule
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAdmin, user } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventsPerPage] = useState(10);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Event stats counters
  const [eventStats, setEventStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Helper to summarize RRULE
  function getRecurrenceSummary(rruleString?: string): string | null {
    if (!rruleString) return null;
    try {
      const rule = RRule.fromString(rruleString);
      // Frequency
      const freqMap: Record<number, string> = {
        [RRule.DAILY]: 'Daily',
        [RRule.WEEKLY]: 'Weekly',
        [RRule.MONTHLY]: 'Monthly',
        [RRule.YEARLY]: 'Yearly',
      };
      let summary = freqMap[rule.options.freq] || 'Custom';
      // Byweekday (show names)
      if (rule.options.byweekday && rule.options.byweekday.length) {
        const weekdayNames = rule.options.byweekday.map((d: any) =>
          typeof d === 'number'
            ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][d]
            : d.toString()
        );
        summary += ' on ' + weekdayNames.join(', ');
      }
      // Until or count
      if (rule.options.until) {
        summary += ` until ${rule.options.until.toLocaleDateString()}`;
      } else if (rule.options.count) {
        summary += ` (${rule.options.count} times)`;
      }
      return summary;
    } catch {
      return 'Invalid recurrence rule';
    }
  }

  // Fetch all pending events for approval
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      // Only fetch pending events
      const response = await fetch(`/api/unified?resource=events&action=pending`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setEvents(result || []);
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
  }, [toast, navigate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // This useEffect is to refetch data when filters change
  useEffect(() => {
    if (user) { // only fetch if user is authenticated
      fetchEvents();
    }
  }, [debouncedSearchTerm, statusFilter, user, fetchEvents]);

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

  // Track when search is happening (when user is typing vs when debounced search is complete)
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected', reason?: string) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      let response, result, contentType;
      if (status === 'rejected') {
        response = await fetch(`/api/unified?resource=events&action=reject&id=${eventId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ reason })
        });
        contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        }
        if (!response.ok) throw new Error(result?.message || `Failed to ${status} event.`);
      } else {
        response = await fetch(`/api/unified?resource=events&action=approve&id=${eventId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          }
        });
        contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        }
        if (!response.ok) throw new Error(result?.message || `Failed to ${status} event.`);
      }
      fetchEvents();
      fetchEventStats(); // Update counters after approval or rejection
      setReviewDialog(false); // Close the rejection reason window after rejecting
      setRejectionReason(''); // Clear the rejection reason textbox after rejecting
      toast({
        title: status === 'approved' ? 'Event Approved' : 'Event Rejected',
        description: status === 'approved'
          ? 'The event has been successfully approved.'
          : 'The event has been successfully rejected and the organiser notified.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${status} event.`,
        variant: 'destructive',
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

  const deleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/admin/events?eventId=${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete event.');
      }

      // Refetch current page to ensure data consistency
      fetchEvents();

      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      });

    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete event.',
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

  // Move fetchEventStats outside useEffect so it's available in the component scope
  async function fetchEventStats() {
    const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }] = await Promise.all([
      supabase.from('event').select('*', { count: 'exact', head: true }),
      supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    ]);
    setEventStats({
      total: total || 0,
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0,
    });
  }

  useEffect(() => {
    if (user) fetchEventStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner variant="page" size="lg" text="Loading events dashboard..." />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-300 rounded-lg p-8 text-red-700 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You are not authorized to access this admin page.</p>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return <Skeleton className="h-32 w-full" />;
  }

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
              <div className="text-2xl font-bold text-blue-600">{eventStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{eventStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{eventStats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{eventStats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${searching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Search events, societies, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${searching ? 'border-blue-300' : ''}`}
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom status dropdown for better UI */}
              <div className="relative inline-block w-48">
                <button
                  className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 font-medium transition-all duration-200 hover:border-pink-400"
                  onClick={() => setShowStatusDropdown((prev) => !prev)}
                  type="button"
                >
                  {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <span className="float-right">▼</span>
                </button>
                {showStatusDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <li
                        key={status}
                        className={`px-4 py-2 cursor-pointer hover:bg-pink-50 text-gray-700 ${statusFilter === status ? 'bg-pink-100 font-semibold' : ''}`}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusDropdown(false);
                        }}
                      >
                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loading ? (
          <LoadingSpinner variant="page" size="md" text="Loading events..." />
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
                        {event.rrule && (
                          <Badge className="bg-blue-100 text-blue-800 ml-2">Recurring</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      {event.rrule && (
                        <div className="text-xs text-blue-700 mb-2">
                          <strong>Recurs:</strong> {getRecurrenceSummary(event.rrule)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.locations?.name || 'Location TBD'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {event.society?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
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
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/?event=${event.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Public
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteEvent(event.id)}
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
                    <p className="text-gray-600">{selectedEvent.locations?.name || 'Location TBD'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Society</h4>
                    <p className="text-gray-600">{selectedEvent.society?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Organiser Email: {selectedEvent.society?.contact_email || <span className="text-red-500">No email provided</span>}</p>
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

                {selectedEvent.rrule && (
                  <div>
                    <h4 className="font-medium text-blue-900">Recurrence</h4>
                    <p className="text-blue-700 text-sm">{getRecurrenceSummary(selectedEvent.rrule)}</p>
                    <p className="text-xs text-blue-500 mt-1">Approving this event will approve all its occurrences.</p>
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
                      {isUpdating
                        ? 'Approving...'
                        : <><CheckCircle className="w-4 h-4 mr-2" />Approve{selectedEvent.rrule ? ' All Occurrences' : ''}</>}
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
