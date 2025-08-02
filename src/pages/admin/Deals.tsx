import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDeals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'admin@dupulse.co.uk') {
        navigate('/admin/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage all student deal submissions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deal Management Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              This feature will allow you to review and manage student deals submitted by partner organizations.
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                  Deal submission form
                </span>
                <span className="text-yellow-600">In Progress</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                  Partner dashboard
                </span>
                <span className="text-yellow-600">In Progress</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                  Deal approval system
                </span>
                <span className="text-yellow-600">Planned</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                  Deal analytics
                </span>
                <span className="text-yellow-600">Planned</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
