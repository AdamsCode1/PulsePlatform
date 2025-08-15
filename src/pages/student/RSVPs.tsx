import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, X, Check } from 'lucide-react';
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
  image_url?: string;
  society: {
    name: string;
  };
}

interface RSVP {
  id: string;
  event_id: string;
  event: Event;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

export default function StudentRSVPs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/student');
        return;
      }
      setUser(user);
      // Fetch studentId from student table
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (studentError || !studentData) {
        console.error('Student not found:', studentError);
        navigate('/login/student');
        return;
      }
      await fetchUserRSVPs(studentData.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/student');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRSVPs = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('rsvp')
        .select(`
          *,
          event:event(
            *,
            society:society(name)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRSVPs(data || []);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast({
        title: "Error",
        description: "Failed to load your RSVPs",
        variant: "destructive",
      });
    }
  };

  const cancelRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvp')
        .update({ status: 'cancelled' })
        .eq('id', rsvpId);

      if (error) throw error;

      setRSVPs(prev => prev.map(rsvp => 
        rsvp.id === rsvpId ? { ...rsvp, status: 'cancelled' } : rsvp
      ));

      toast({
        title: "RSVP Cancelled",
        description: "Your RSVP has been cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to cancel RSVP",
        variant: "destructive",
      });
    }
  };

  const confirmRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ status: 'confirmed' })
        .eq('id', rsvpId);

      if (error) throw error;

      setRSVPs(prev => prev.map(rsvp => 
        rsvp.id === rsvpId ? { ...rsvp, status: 'confirmed' } : rsvp
      ));

      toast({
        title: "RSVP Confirmed",
        description: "Your RSVP has been confirmed successfully",
      });
    } catch (error) {
      console.error('Error confirming RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to confirm RSVP",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
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

  const confirmedRSVPs = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const pendingRSVPs = rsvps.filter(rsvp => rsvp.status === 'pending');
  const cancelledRSVPs = rsvps.filter(rsvp => rsvp.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Your RSVPs</h1>
          <p className="text-gray-600 mt-2">
            Manage your event registrations and see your attendance history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedRSVPs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingRSVPs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total RSVPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{rsvps.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* RSVP List */}
          <div className="lg:col-span-3">
            {rsvps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No RSVPs Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't signed up for any events yet. Start exploring!
                  </p>
                  <Button onClick={() => navigate('/')}>
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rsvps.map((rsvp) => (
                  <Card key={rsvp.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{rsvp.event.title}</h3>
                            {getStatusBadge(rsvp.status)}
                            {isEventPast(rsvp.event.date) && (
                              <Badge variant="outline">Past Event</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{rsvp.event.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(rsvp.event.date).toLocaleDateString()} at {rsvp.event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {rsvp.event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {rsvp.event.society.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          RSVP'd on {new Date(rsvp.created_at).toLocaleDateString()}
                        </div>

                        {!isEventPast(rsvp.event.date) && (
                          <div className="flex gap-2">
                            {rsvp.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => confirmRSVP(rsvp.id)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelRSVP(rsvp.id)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {rsvp.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => cancelRSVP(rsvp.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel RSVP
                              </Button>
                            )}
                            {rsvp.status === 'cancelled' && (
                              <Button
                                size="sm"
                                onClick={() => confirmRSVP(rsvp.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Re-confirm
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
