import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// List of admin emails allowed to access admin pages
const ADMIN_EMAILS = [
  'jakubnosek72@gmail.com', // Replace with real admin emails
];

interface PendingEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  category?: string;
  society_id: string;
  signup_link?: string;
  status: string;
}

const Approvals = () => {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email || null;
      setUserEmail(email);
      if (!email || !ADMIN_EMAILS.includes(email)) {
        navigate('/'); // Redirect if not admin
      }
    });
  }, [navigate]);

  // Fetch pending events
  useEffect(() => {
    const fetchPendingEvents = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/events/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch pending events');
        const data = await res.json();
        setPendingEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingEvents();
  }, []);

  // Approve event
  const handleApprove = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    await fetch(`/api/events/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPendingEvents(events => events.filter(e => e.id !== id));
  };

  // Reject event
  const handleReject = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    await fetch(`/api/events/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPendingEvents(events => events.filter(e => e.id !== id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Event Approvals</h1>
      {pendingEvents.length === 0 ? (
        <div>No pending events.</div>
      ) : (
        <ul className="space-y-4">
          {pendingEvents.map(event => (
            <li key={event.id} className="border rounded p-4 bg-white shadow">
              <div className="font-semibold text-lg">{event.name}</div>
              <div className="text-gray-600">{event.description}</div>
              <div className="text-sm text-gray-500">{event.start_time} - {event.end_time}</div>
              <div className="text-sm text-gray-500">Location: {event.location}</div>
              <div className="mt-2 flex gap-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleApprove(event.id)}>Approve</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleReject(event.id)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Approvals;
