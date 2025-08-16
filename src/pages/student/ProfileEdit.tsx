import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfileEdit = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setError('User not found');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('student')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .single();
      if (error || !data) {
        setError('Could not fetch profile');
      } else {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError('User not found');
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('student')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
      })
      .eq('user_id', userId);
    // Update display name in auth user_metadata
    const fullName = profile.first_name + (profile.last_name ? ' ' + profile.last_name : '');
    const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: fullName, first_name: profile.first_name, last_name: profile.last_name } });
    if (error || metaError) {
      setError('Failed to update profile');
    } else {
      setSuccess(true);
      // Refetch profile to update UI
      const { data, error: fetchError } = await supabase
        .from('student')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .single();
      if (!fetchError && data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      }
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={profile.first_name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={profile.last_name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">Profile updated!</p>}
                <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Changes'}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEdit;
