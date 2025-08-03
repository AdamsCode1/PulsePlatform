import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Calendar, Plus, BarChart3, Users, Clock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/partner');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/partner');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Partner Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Manage your events, deals, and connect with students.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Student Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/partner/submit-event')}
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Event
                </Button>
                <Button 
                  onClick={() => navigate('/partner/submit-deal')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Submit Deal
                </Button>
                <Button 
                  onClick={() => navigate('/partner/events')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button 
                  onClick={() => navigate('/partner/deals')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Manage Deals
                </Button>
              </CardContent>
            </Card>

            {/* Partner Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Partner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Account Type</p>
                    <p className="text-sm text-gray-600">Partner Organization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Partner Features Coming Soon</CardTitle>
                <CardDescription>We're building powerful tools for our partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Partner Portal Under Development
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We're building comprehensive tools for partner organizations to connect with students.
                  </p>
                  
                  <div className="space-y-4 max-w-md mx-auto text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        Event submission for partners
                      </span>
                      <span className="text-yellow-600">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        Deal management system
                      </span>
                      <span className="text-yellow-600">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        Analytics dashboard
                      </span>
                      <span className="text-yellow-600">Planned</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        Student engagement tools
                      </span>
                      <span className="text-yellow-600">Planned</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
