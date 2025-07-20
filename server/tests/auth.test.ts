import request from 'supertest';
import app from '../index';
describe('POST /api/login', () => {
  it('should fail with missing fields', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing/);
  });
  it('should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/login').send({ email: 'fake@domain.com', password: 'wrong', type: 'society' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });
});
