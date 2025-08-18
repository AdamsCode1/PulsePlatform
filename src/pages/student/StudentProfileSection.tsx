import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const StudentProfileSection = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('student')
        .select('id, name, email, created_at')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4">
            <LoadingSpinner variant="page" size="sm" text="Loading profile..." />
          </div>
        ) : profile ? (
          <div>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Profile not found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProfileSection;
