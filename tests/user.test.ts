import request from 'supertest';
import app from '../server/index';

describe('GET /api/users', () => {
  it('should return a list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Optionally, check for at least one user
    // expect(res.body.length).toBeGreaterThan(0);
  });
});
