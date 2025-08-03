import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PartnerSubmitDeal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/partner');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/partner');
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
            onClick={() => navigate('/partner/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Deal</h1>
          <p className="text-gray-600 mt-2">
            Submit an exclusive deal for Durham University students.
          </p>
        </div>

        <Card>
          <CardContent className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Partner Deal Submission Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              This feature will allow partner organizations to submit exclusive deals and promotions for Durham University students.
            </p>
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-center text-sm text-yellow-600">
                <Clock className="w-4 h-4 mr-2" />
                Feature in development
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
