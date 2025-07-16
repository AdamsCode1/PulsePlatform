import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const categories = [
  'academic',
  'Active sport',
  'interest',
  'political and cause',
  'cultural and faith',
  'professional development',
  'media',
  'theatre',
  'music',
  'fundraising',
  'associations',
  'social',
  'miscellaneous'
];

export default function EventSubmissionPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    category: categories[0],
    society_id: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = value => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Frontend validation for required fields
    if (!form.name.trim() || !form.start_date || !form.start_time || !form.end_date || !form.end_time || !form.location.trim() || !form.category.trim() || !form.society_id.trim()) {
      setStatus('Please fill in all required fields.');
      return;
    }
    setStatus('Submitting...');
    try {
      console.log('Form values:', form);
      // Use YYYY-MM-DD directly from input
      const start = form.start_date && form.start_time ? new Date(`${form.start_date}T${form.start_time}`) : null;
      const end = form.end_date && form.end_time ? new Date(`${form.end_date}T${form.end_time}`) : null;
      console.log('Start:', start, 'End:', end);
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        setStatus('Invalid date or time format.');
        return;
      }
      const payload = {
        ...form,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      };
      delete payload.start_date;
      delete payload.end_date;
      // Do NOT delete payload.start_time or payload.end_time
      console.log('Submitting event payload:', payload); // Debug log
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus('Event submitted successfully!');
        setForm({ ...form, name: '', description: '', start_date: '', start_time: '', end_date: '', end_time: '', location: '' });
      } else {
        const error = await res.json();
        setStatus('Error: ' + (error.message || 'Could not submit event.'));
      }
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit an Event</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input name="name" id="name" value={form.name} onChange={handleChange} placeholder="Event Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" value={form.description} onChange={handleChange} placeholder="Description" />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input name="start_time" type="time" value={form.start_time} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input name="end_time" type="time" value={form.end_time} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input name="location" id="location" value={form.location} onChange={handleChange} placeholder="Location" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={handleCategoryChange} name="category">
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="society_id">Society ID</Label>
            <Input name="society_id" id="society_id" value={form.society_id} onChange={handleChange} placeholder="Society ID" required />
          </div>
          <Button type="submit" className="w-full">Submit Event</Button>
        </form>
        {status && <div className="px-6 pb-6 text-sm text-muted-foreground">{status}</div>}
      </Card>
    </div>
  );
}
