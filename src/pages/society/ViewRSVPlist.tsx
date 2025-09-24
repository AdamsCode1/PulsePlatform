import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function rsvpsToCSV(rsvps: any[]): string {
  const header = ['First Name', 'Last Name', 'Email', 'RSVP Time'];
  const rows = rsvps.map(rsvp => [
    rsvp.student?.first_name ?? '',
    rsvp.student?.last_name ?? '',
    rsvp.student?.email ?? '',
    rsvp.created_at ? format(new Date(rsvp.created_at), 'yyyy-MM-dd HH:mm:ss') : ''
  ]);
  return [header.join(','), ...rows.map(row => row.join(','))].join('\n');
}

const ViewRSVPlist = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { toast } = useToast();

  // Example: occurrences and RSVPs grouped by occurrence
  // Replace with your actual data structure if needed
  const [occurrences, setOccurrences] = useState<any[]>([]); // [{start_time, rsvps: [...]}, ...]
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fetch all occurrences and RSVPs, then merge for pagination
  const [allOccurrences, setAllOccurrences] = useState<any[]>([]); // [{start_time, end_time, ...}]

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMsg('');
      try {
        // Fetch RSVPs
        const rsvpRes = await fetch(`/api/society/rsvpList?eventId=${eventId}`);
        if (!rsvpRes.ok) throw new Error('Failed to fetch RSVP list');
        const rsvpResult = await rsvpRes.json();
        // Fetch event occurrences
        const occRes = await fetch(`/api/unified?resource=events&action=single&id=${eventId}`);
        if (!occRes.ok) throw new Error('Failed to fetch event occurrences');
        const occResult = await occRes.json();
        let occurrences = [];
        if (occResult && occResult.occurrences) {
          occurrences = occResult.occurrences;
        } else if (occResult && occResult.rrule) {
          occurrences = [{ start_time: occResult.start_time, end_time: occResult.end_time }];
        }
        setAllOccurrences(occurrences);
        console.log('All occurrences:', occurrences);
        console.log('All RSVPs:', rsvpResult.rsvps);
        // Merge: for each occurrence, attach its RSVP list by matching occurrence_start_time
        const merged = occurrences.map((occ, occIdx) => ({
          ...occ,
          rsvps: (rsvpResult.rsvps || []).filter((rsvp, rsvpIdx) => {
            if (!rsvp.occurrence_start_time || !occ.start_time) {
              console.log(`SKIP: occIdx=${occIdx}, rsvpIdx=${rsvpIdx}, occ.start_time=${occ.start_time}, rsvp.occurrence_start_time=${rsvp.occurrence_start_time}`);
              return false;
            }
            const occDate = new Date(occ.start_time);
            const rsvpDate = new Date(rsvp.occurrence_start_time);
            console.log(`COMPARE: occIdx=${occIdx}, rsvpIdx=${rsvpIdx}, occ.start_time=${occ.start_time}, rsvp.occurrence_start_time=${rsvp.occurrence_start_time}, occDate=${occDate.toISOString()}, rsvpDate=${rsvpDate.toISOString()}`);
            const match = occDate.getUTCFullYear() === rsvpDate.getUTCFullYear() &&
              occDate.getUTCMonth() === rsvpDate.getUTCMonth() &&
              occDate.getUTCDate() === rsvpDate.getUTCDate() &&
              occDate.getUTCHours() === rsvpDate.getUTCHours() &&
              occDate.getUTCMinutes() === rsvpDate.getUTCMinutes();
            if (match) {
              console.log(`MATCH: occIdx=${occIdx}, rsvpIdx=${rsvpIdx}`);
            } else {
              console.log(`NOMATCH: occIdx=${occIdx}, rsvpIdx=${rsvpIdx}`);
            }
            return match;
          })
        }));
        console.log('Merged occurrences:', merged);
        setOccurrences(merged);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load RSVP or occurrence data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  // Reset currentIdx to first occurrence that is today or in the future
  useEffect(() => {
    if (occurrences.length === 0) {
      setCurrentIdx(0);
      return;
    }
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    console.log('Today ISO:', todayStr);
    occurrences.forEach((occ, i) => {
      const occDateStr = new Date(occ.start_time).toISOString().slice(0, 10);
      console.log(`Occurrence ${i}:`, occ.start_time, 'ISO:', occDateStr);
    });
    const idx = occurrences.findIndex(occ => {
      const occDateStr = new Date(occ.start_time).toISOString().slice(0, 10);
      return occDateStr >= todayStr;
    });
    console.log('Selected idx:', idx);
    setCurrentIdx(idx === -1 ? 0 : idx);
  }, [occurrences.length]);

  const handleDownloadCSV = () => {
    try {
      const csv = rsvpsToCSV(occurrences[currentIdx]?.rsvps || []);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rsvp_list.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'CSV exported!',
        description: 'The RSVP list was downloaded as CSV.',
        variant: 'default',
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (err: any) {
      toast({
        title: 'Download failed',
        description: err.message || 'Could not download CSV file.',
        variant: 'destructive',
        duration: 4000,
        position: 'bottom-right',
      });
    }
  };

  const handleEmailCSV = async () => {
    setEmailing(true);
    setErrorMsg('');
    try {
      const csv = rsvpsToCSV(occurrences[currentIdx]?.rsvps || []);
      const response = await fetch('/api/society/emailRSVPList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, csv })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send email');
      toast({
        title: 'CSV emailed!',
        description: 'The RSVP list was sent to the society admin.',
        variant: 'default',
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-lg flex items-center mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="bg-purple-600 text-white hover:bg-purple-700 transition-colors py-2 px-4 rounded-lg font-semibold shadow"
        >
          ← Back to Dashboard
        </Button>
        <Button
          onClick={handleDownloadCSV}
          className="ml-4 bg-green-600 text-white hover:bg-green-700 transition-colors py-2 px-4 rounded-lg font-semibold shadow flex items-center"
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <Button
          onClick={handleEmailCSV}
          disabled={emailing}
          className="ml-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors py-2 px-4 rounded-lg font-semibold shadow"
        >
          Email this list
        </Button>
      </div>
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>RSVP List</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}
          {loading ? (
            <Skeleton className="h-8 w-full mb-2" />
          ) : occurrences.length > 0 ? (
            <>
              <div className="flex items-center justify-between mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(idx => Math.max(0, idx - 1))}
                >
                  ← Prev
                </Button>
                <div className="text-sm font-medium text-purple-700">
                  {occurrences[currentIdx].start_time && !isNaN(Date.parse(occurrences[currentIdx].start_time))
                    ? format(new Date(occurrences[currentIdx].start_time), 'PPpp')
                    : (occurrences[currentIdx].start_time === 'single' ? 'Single Event' : 'Unknown Date')}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIdx === occurrences.length - 1}
                  onClick={() => setCurrentIdx(idx => Math.min(occurrences.length - 1, idx + 1))}
                >
                  Next →
                </Button>
              </div>
              <div className="grid gap-4 mt-4">
                {occurrences[currentIdx].rsvps.map((rsvp, idx) => (
                  <Card key={idx} className="border border-purple-200 shadow-sm">
                    <CardContent className="py-4">
                      <div className="font-bold text-lg text-purple-700">
                        {rsvp.student?.first_name} {rsvp.student?.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">{rsvp.student?.email}</div>
                      {rsvp.created_at && (
                        <div className="text-xs text-gray-400 mt-1">
                          RSVP Time: {format(new Date(rsvp.created_at), 'PPpp')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : rsvps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4 text-purple-300">
                <circle cx="32" cy="32" r="32" fill="#E9D5FF" />
                <path d="M20 32h24M32 20v24" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-lg font-semibold text-purple-700 mb-2">No RSVPs yet</div>
              <div className="text-gray-500">Once students RSVP, they’ll appear here.</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {rsvps.map((rsvp, idx) => (
                <Card key={idx} className="border border-purple-200 shadow-sm">
                  <CardContent className="py-4">
                    <div className="font-bold text-lg text-purple-700">
                      {rsvp.student?.first_name} {rsvp.student?.last_name}
                    </div>
                    <div className="text-gray-600 text-sm">{rsvp.student?.email}</div>
                    {rsvp.created_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        RSVP Time: {format(new Date(rsvp.created_at), 'PPpp')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewRSVPlist;
