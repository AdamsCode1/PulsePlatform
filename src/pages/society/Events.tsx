import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Users, Plus, Search, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  created_at: string;
  rsvps?: {
    count: number;
  }[];
}

export default function SocietyEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/society');
        return;
      }
      setUser(user);
      await fetchSocietyEvents(user.email);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/society');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocietyEvents = async (email: string) => {
    try {
      // First get society ID
      const { data: societyData, error: societyError } = await supabase
        .from('societies')
        .select('id')
        .eq('email', email)
        .single();

      if (societyError) throw societyError;

      // Then get events for this society
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          rsvps:rsvps(count())
        `)
        .eq('society_id', societyData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load your events",
        variant: "destructive",
      });
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
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

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/society/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
              <p className="text-gray-600 mt-2">
                View and manage all your society's events.
              </p>
            </div>
            <Button onClick={() => navigate('/society/submit-event')}>
              <Plus className="w-4 h-4 mr-2" />
              Submit New Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
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
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {events.length === 0 ? 'No Events Yet' : 'No Events Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {events.length === 0 
                  ? "You haven't submitted any events yet. Create your first event to get started!"
                  : "No events match your current search and filter criteria."
                }
              </p>
              {events.length === 0 && (
                <Button onClick={() => navigate('/society/submit-event')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        {getStatusBadge(event.status)}
                        {isEventPast(event.date) && (
                          <Badge variant="outline">Past Event</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {event.rsvps?.[0]?.count || 0} RSVPs
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Max {event.max_attendees}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created on {new Date(event.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      {event.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/society/submit-event?edit=${event.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {event.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/?event=${event.id}`)}
                        >
                          View Public
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
