import request from 'supertest';
import app from '../server/index';

describe('Societies API', () => {
  let createdSocietyId: string;
  const uniqueSocietyName = `Test Society ${Date.now()}`;
  const uniqueSocietyEmail = `test-society-${Date.now()}@example.com`;

  it('GET /api/societies should return an array', async () => {
    const res = await request(app).get('/api/societies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/societies should create a new society', async () => {
    const society = {
      name: uniqueSocietyName,
      contact_email: uniqueSocietyEmail,
    };
    const res = await request(app).post('/api/societies').send(society);
    if (res.status !== 201) {
      console.error('Society POST error:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(society.name);
    createdSocietyId = res.body.id;
  });

  it('GET /api/societies/:id should return the created society', async () => {
    const res = await request(app).get(`/api/societies/${createdSocietyId}`);
    if (res.status !== 200) {
      console.error('Society GET by id error:', res.status, res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdSocietyId);
  });

  it('should return 404 for non-existent society', async () => {
    const res = await request(app).get('/api/societies/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('Events API', () => {
  let createdEventId: string;
  let testSocietyId: string;
  const uniqueEventName = `Test Event ${Date.now()}`;
  const uniqueEventCategory = `Test Category ${Date.now()}`;

  beforeAll(async () => {
    // Create a society for event association
    const societyRes = await request(app).post('/api/societies').send({
      name: `Event Test Society ${Date.now()}`,
      contact_email: `event-society-${Date.now()}@example.com`,
    });
    testSocietyId = societyRes.body.id;
  });

  it('POST /api/events should create a new event', async () => {
    const event = {
      name: uniqueEventName,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      location: 'Test Location',
      society_id: testSocietyId,
      category: uniqueEventCategory,
      description: 'Test event description', // optional but non-empty
    };
    const res = await request(app).post('/api/events').send(event);
    if (res.status !== 201) {
      console.error('Event POST error:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdEventId = res.body.id;
  });

  it('GET /api/events should return an array', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/events/:id should return the created event', async () => {
    const res = await request(app).get(`/api/events/${createdEventId}`);
    if (res.status !== 200) {
      console.error('Event GET by id error:', res.status, res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdEventId);
  });
});

describe('RSVPs API', () => {
  let createdRSVPId: string;
  let testUserId: string;
  let testEventId: string;
  const uniqueUserEmail = `rsvpuser-${Date.now()}@example.com`;
  const uniqueSocietyName = `RSVP Society ${Date.now()}`;
  const uniqueSocietyEmail = `rsvpsociety-${Date.now()}@example.com`;
  const uniqueEventName = `RSVP Event ${Date.now()}`;
  const uniqueEventCategory = `RSVP Category ${Date.now()}`;

  beforeAll(async () => {
    // Create a user
    const userRes = await request(app).post('/api/users').send({
      name: 'RSVP User',
      email: uniqueUserEmail,
    });
    console.log('RSVP userRes.status:', userRes.status);
    console.log('RSVP userRes.body:', userRes.body);
    testUserId = userRes.body.id;
    // Create a society and event
    const societyRes = await request(app).post('/api/societies').send({
      name: uniqueSocietyName,
      contact_email: uniqueSocietyEmail,
    });
    const eventRes = await request(app).post('/api/events').send({
      name: uniqueEventName,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      location: 'RSVP Location',
      society_id: societyRes.body.id,
      category: uniqueEventCategory,
      description: 'RSVP event description',
    });
    testEventId = eventRes.body.id;
  });

  it('POST /api/rsvps should create a new RSVP', async () => {
    const rsvp = {
      user_id: testUserId,
      event_id: testEventId,
    };
    console.log('RSVP testUserId:', testUserId);
    console.log('RSVP testEventId:', testEventId);
    console.log('RSVP payload:', rsvp);
    const res = await request(app).post('/api/rsvps').send(rsvp);
    if (res.status !== 201) {
      console.error('RSVP POST error:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdRSVPId = res.body.id;
  });

  it('GET /api/rsvps should return an array', async () => {
    const res = await request(app).get('/api/rsvps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/rsvps/:id should return the created RSVP', async () => {
    const res = await request(app).get(`/api/rsvps/${createdRSVPId}`);
    if (res.status !== 200) {
      console.error('RSVP GET by id error:', res.status, res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdRSVPId);
  });
});
