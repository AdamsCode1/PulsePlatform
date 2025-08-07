import request from 'supertest';
import app from '../server/index';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let adminToken: string;
let societyToken: string;
let testEventId: string;
let testSocietyId: string;
let adminUserId: string;
let societyUserId: string;

const adminEmail = `test-admin-${Date.now()}@example.com`;
const societyEmail = `test-society-for-admin-test-${Date.now()}@example.com`;
const testPassword = 'password123';

describe('Admin API', () => {

  beforeAll(async () => {
    // 1. Create an admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: testPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' }
    });
    if (adminError) console.error('Error creating admin user for test:', adminError);
    adminUserId = adminData.user!.id;

    // 2. Create a society user
    const { data: societyUserData, error: societyUserError } = await supabase.auth.admin.createUser({
      email: societyEmail,
      password: testPassword,
      email_confirm: true,
      app_metadata: { role: 'society' }
    });
    if (societyUserError) console.error('Error creating society user for test:', societyUserError);
    societyUserId = societyUserData.user!.id;

    // 3. Get tokens for both users
    const { data: adminLoginData, error: adminLoginError } = await supabase.auth.signInWithPassword({ email: adminEmail, password: testPassword });
    if (adminLoginError) console.error('Error logging in admin for test:', adminLoginError);
    adminToken = adminLoginData.session!.access_token;

    const { data: societyLoginData, error: societyLoginError } = await supabase.auth.signInWithPassword({ email: societyEmail, password: testPassword });
    if (societyLoginError) console.error('Error logging in society for test:', societyLoginError);
    societyToken = societyLoginData.session!.access_token;

    // 4. Create a society profile for the society user
    const { data: societyProfile, error: societyProfileError } = await supabase
      .from('society')
      .insert({ name: 'Test Society for Admin Test', contact_email: societyEmail, user_id: societyUserData.user!.id })
      .select()
      .single();
    if (societyProfileError) console.error('Error creating society profile for test:', societyProfileError);
    testSocietyId = societyProfile!.id;

    // 5. Create a pending event submitted by the society
    const { data: event, error: eventError } = await supabase
      .from('event')
      .insert({ name: 'Test Event for Admin Approval', status: 'pending', society_id: testSocietyId, start_time: new Date().toISOString(), end_time: new Date().toISOString(), location: 'Test' })
      .select()
      .single();
    if (eventError) console.error('Error creating test event:', eventError);
    testEventId = event!.id;
  });

  // Test route protection
  it('should deny access to a non-admin user', async () => {
    const res = await request(app)
      .patch(`/api/admin/events`)
      .set('Authorization', `Bearer ${societyToken}`)
      .send({ eventId: testEventId, status: 'approved' });

    expect(res.status).toBe(403);
  });

  it('should deny access if no token is provided', async () => {
    const res = await request(app)
      .patch(`/api/admin/events`)
      .send({ eventId: testEventId, status: 'approved' });

    expect(res.status).toBe(403);
  });

  // Test admin functionality
  it('should allow an admin to approve a pending event', async () => {
    const res = await request(app)
      .patch(`/api/admin/events`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ eventId: testEventId, status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('should allow an admin to reject an approved event', async () => {
    const res = await request(app)
      .patch(`/api/admin/events`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ eventId: testEventId, status: 'rejected', rejection_reason: 'Test rejection' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
  });

  it('should log admin actions, which can be retrieved from the activity endpoint', async () => {
    // First, perform an action to log (approve the event again)
    await request(app)
        .patch(`/api/admin/events`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ eventId: testEventId, status: 'approved' });

    // Now, fetch the activity log
    const res = await request(app)
        .get('/api/admin/activity')
        .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // The most recent action should be the one we just performed
    const latestLog = res.body[0];
    expect(latestLog.action).toBe('event.approved');
    expect(latestLog.target_entity).toBe('event');
    expect(latestLog.target_id).toBe(testEventId);
    expect(latestLog.user_email).toBe(adminEmail);
  });

  it('should allow an admin to get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Check if our test users are in the list
    expect(res.body.some((user: any) => user.email === adminEmail)).toBe(true);
    expect(res.body.some((user: any) => user.email === societyEmail)).toBe(true);
  });

  it('should allow an admin to get dashboard chart data', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // Clean up created users
    if (adminUserId) await supabase.auth.admin.deleteUser(adminUserId);
    if (societyUserId) await supabase.auth.admin.deleteUser(societyUserId);
    // The event and society profile should be cleaned up by cascade delete
  });
});
