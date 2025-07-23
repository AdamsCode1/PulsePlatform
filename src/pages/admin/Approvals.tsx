import { useEffect, useState, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('future');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectEventId, setRejectEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const reasonInputRef = useRef<HTMLInputElement>(null);
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

  // Open modal
  const openRejectModal = (id: string) => {
    setRejectEventId(id);
    setRejectReason('');
    setShowRejectModal(true);
    setTimeout(() => reasonInputRef.current?.focus(), 100);
  };

  // Close modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectEventId(null);
    setRejectReason('');
  };

  // Reject event with reason
  const handleRejectWithReason = async () => {
    if (!rejectEventId) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    await fetch(`/api/events/${rejectEventId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: rejectReason })
    });
    setPendingEvents(events => events.filter(e => e.id !== rejectEventId));
    closeRejectModal();
  };

  // Sort events by start_time
  const sortedEvents = [...pendingEvents].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Split events into future and past
  const now = new Date();
  const futureEvents = sortedEvents.filter(e => new Date(e.end_time) >= now);
  const pastEvents = [...sortedEvents.filter(e => new Date(e.end_time) < now)].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  // Helper to format date heading
  const headingFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Group events by date
  function groupByDate(events: typeof sortedEvents) {
    const eventsByDate: { [date: string]: typeof sortedEvents } = {};
    events.forEach(event => {
      const dateStr = headingFormatter.format(new Date(event.start_time));
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
      eventsByDate[dateStr].push(event);
    });
    return eventsByDate;
  }

  const eventsByDate = activeTab === 'future' ? groupByDate(futureEvents) : groupByDate(pastEvents);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Event Approvals</h1>
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'future' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('future')}
        >
          Future Events
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>
      {Object.values(eventsByDate).flat().length === 0 ? (
        <div>No pending events.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByDate).map(([dateStr, events]) => (
            <div key={dateStr}>
              <div className="font-bold text-md mb-4 text-blue-700">{dateStr}</div>
              <ul className="space-y-4">
                {events.map(event => {
                  const start = new Date(event.start_time);
                  const end = new Date(event.end_time);
                  const timeFormatter = new Intl.DateTimeFormat(undefined, {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  });
                  const startTimeStr = timeFormatter.format(start);
                  const endTimeStr = timeFormatter.format(end);
                  return (
                    <li key={event.id} className="border rounded p-4 bg-white shadow">
                      <div className="font-semibold text-lg">{event.name}</div>
                      <div className="text-gray-600">{event.description}</div>
                      <div className="text-sm text-gray-500">
                        {startTimeStr} – {endTimeStr}
                      </div>
                      <div className="text-sm text-gray-500">Location: {event.location}</div>
                      {event.signup_link && event.signup_link.trim() !== '' && (
                        <div className="mt-2">
                          <span className="block text-xs text-gray-500 mb-1">External Signup Link:</span>
                          <a
                            href={event.signup_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:underline break-all"
                          >
                            {event.signup_link}
                          </a>
                        </div>
                      )}
                      {activeTab === 'future' ? (
                        <div className="mt-2 flex gap-2">
                          <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleApprove(event.id)}>Approve</button>
                          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => openRejectModal(event.id)}>Reject</button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-sm ${event.status === 'approved' ? 'bg-green-100 text-green-700' : event.status === 'denied' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            Status: {event.status === 'pending' ? 'Ghosted (Pending)' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Reject Event</h2>
            <p className="mb-2 text-sm">Please provide a reason for rejection. This will be sent to the society's contact email.</p>
            <input
              ref={reasonInputRef}
              type="text"
              className="border rounded w-full px-2 py-1 mb-4"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection"
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={closeRejectModal}>Cancel</button>
              <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={handleRejectWithReason} disabled={!rejectReason.trim()}>
                Reject Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
