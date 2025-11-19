import request from 'supertest';
import app from '../src/index.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/services/authService.js';

describe('Auth flows', () => {
  // MongoDB connection is handled by setup.ts

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('logs in student with correct role and redirects tokens', async () => {
    const passwordHash = await hashPassword('password123');
    const user = await User.create({ email: 's@example.com', passwordHash, role: 'student' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 's@example.com', password: 'password123', role: 'student' })
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('student');
    // Cookies should be set
    const cookies = (res.header['set-cookie'] || []) as string[];
    expect(cookies.join(';')).toContain('access_token');
    expect(cookies.join(';')).toContain('refresh_token');
  });

  it('rejects login when role mismatched', async () => {
    const passwordHash = await hashPassword('password123');
    await User.create({ email: 'a@example.com', passwordHash, role: 'academic' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@example.com', password: 'password123', role: 'student' })
      .expect(403);

    expect(res.body.code).toBe('ROLE_MISMATCH');
  });
});


