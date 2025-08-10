import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Shield, Database as DatabaseIcon, Wrench } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/apiConfig';

type SettingsConfig = {
  eventApproval: {
    autoApproveSocietyEvents: boolean;
    requireRejectionReason: boolean;
  };
  dealModeration: {
    requireApproval: boolean;
  };
  userRegistration: {
    allowPublicRegistration: boolean;
    requireEmailVerification: boolean;
  };
  emailNotifications: {
    notifyAdminsOnSubmission: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const checkAuth = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const defaultConfig: SettingsConfig = {
    eventApproval: { autoApproveSocietyEvents: false, requireRejectionReason: true },
    dealModeration: { requireApproval: true },
    userRegistration: { allowPublicRegistration: true, requireEmailVerification: true },
    emailNotifications: { notifyAdminsOnSubmission: true, digestFrequency: 'weekly' },
    maintenance: { enabled: false, message: 'The platform is under maintenance. Please check back later.' },
  };

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch settings');
      return json as { id: string; config: SettingsConfig };
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const updateSettings = useMutation({
    mutationFn: async (config: SettingsConfig) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ config }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update settings');
      return json as { id: string; config: SettingsConfig };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({ title: 'Settings updated', description: 'Platform settings saved successfully.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Failed to update settings', variant: 'destructive' });
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  const cfg = settingsQuery.data?.config ?? defaultConfig;

  const onToggle = <K extends keyof SettingsConfig>(
    section: K,
    key: keyof SettingsConfig[K],
    value: any
  ) => {
    const next: SettingsConfig = { ...cfg, [section]: { ...(cfg as any)[section], [key]: value } } as SettingsConfig;
    updateSettings.mutate(next);
  };

  const onUpdate = (nextCfg: SettingsConfig) => updateSettings.mutate(nextCfg);

  const isSaving = (updateSettings as any).isPending ?? (updateSettings as any).isLoading ?? false;

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
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
            {settingsQuery.isLoading && <Badge variant="secondary" className="ml-2">Loading…</Badge>}
          </div>
          <p className="text-gray-600 mt-2">
            Manage platform configuration, admin accounts, and maintenance tools.
          </p>
        </div>

        {settingsQuery.isError && (
          <Card className="mb-6">
            <CardContent className="py-4 flex items-center justify-between">
              <p className="text-sm text-red-600">Failed to load settings.</p>
              <Button size="sm" onClick={() => settingsQuery.refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-approve society events</p>
                  <p className="text-sm text-gray-500">Bypass manual review for trusted societies</p>
                </div>
                <Switch
                  checked={!!cfg.eventApproval.autoApproveSocietyEvents}
                  onCheckedChange={(checked) => onToggle('eventApproval', 'autoApproveSocietyEvents', checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require rejection reason</p>
                  <p className="text-sm text-gray-500">Admins must provide a reason when rejecting</p>
                </div>
                <Switch
                  checked={!!cfg.eventApproval.requireRejectionReason}
                  onCheckedChange={(checked) => onToggle('eventApproval', 'requireRejectionReason', checked)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Moderation</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require approval for deals</p>
                <p className="text-sm text-gray-500">All partner deals require admin approval</p>
              </div>
              <Switch
                checked={!!cfg.dealModeration.requireApproval}
                onCheckedChange={(checked) => onToggle('dealModeration', 'requireApproval', checked)}
                disabled={isSaving}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow public registration</p>
                  <p className="text-sm text-gray-500">Anyone can sign up without invitation</p>
                </div>
                <Switch
                  checked={!!cfg.userRegistration.allowPublicRegistration}
                  onCheckedChange={(checked) => onToggle('userRegistration', 'allowPublicRegistration', checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require email verification</p>
                  <p className="text-sm text-gray-500">Users must verify email before using the platform</p>
                </div>
                <Switch
                  checked={!!cfg.userRegistration.requireEmailVerification}
                  onCheckedChange={(checked) => onToggle('userRegistration', 'requireEmailVerification', checked)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notify admins on submissions</p>
                  <p className="text-sm text-gray-500">Send email when new event/deal is submitted</p>
                </div>
                <Switch
                  checked={!!cfg.emailNotifications.notifyAdminsOnSubmission}
                  onCheckedChange={(checked) => onToggle('emailNotifications', 'notifyAdminsOnSubmission', checked)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Digest frequency</label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-white"
                  value={cfg.emailNotifications.digestFrequency || 'weekly'}
                  onChange={(e) => onToggle('emailNotifications', 'digestFrequency', e.target.value)}
                  disabled={isSaving}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable maintenance mode</p>
                  <p className="text-sm text-gray-500">Show a site-wide maintenance banner</p>
                </div>
                <Switch
                  checked={!!cfg.maintenance.enabled}
                  onCheckedChange={(checked) => onToggle('maintenance', 'enabled', checked)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maintenance message</label>
                <Input
                  value={cfg.maintenance.message || ''}
                  onChange={(e) => onToggle('maintenance', 'message', e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Admin Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Add or remove admins using the provided scripts, or integrate here in future.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => navigate('/docs#admin-scripts')}>View Admin Scripts</Button>
                <Button onClick={() => navigate('/admin/users')}>Manage Users</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DatabaseIcon className="w-4 h-4" /> System Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    await fetch(`${API_BASE_URL}/admin/system`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    toast({ title: 'Cache cleared' });
                  }}
                >Clear Cache</Button>
                <Button
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    const res = await fetch(`${API_BASE_URL}/admin/system`, {
                      method: 'PATCH',
                      headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    const json = await res.json();
                    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dupulse-export-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Export complete' });
                  }}
                >Export Data</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
