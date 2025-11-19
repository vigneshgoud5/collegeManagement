import request from 'supertest';
import app from '../src/index.js';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { hashPassword } from '../src/services/authService.js';

async function loginAs(email: string, password: string, role: 'academic' | 'student') {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email, password, role });
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} - ${JSON.stringify(res.body)}`);
  }
  return agent;
}

describe('Students flows', () => {
  // MongoDB connection is handled by setup.ts
  beforeEach(async () => {
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
  });

  it('student can get and update own profile', async () => {
    const passwordHash = await hashPassword('pw');
    const student = await User.create({ email: 's1@example.com', passwordHash, role: 'student' });
    await StudentProfile.create({ 
      user: student._id, 
      firstName: 'Stu', 
      lastName: 'Dent',
      contact: { phone: '1234567890', address: 'Old Address' }
    });

    const agent = await loginAs('s1@example.com', 'pw', 'student');
    const res1 = await agent.get('/api/students/me').expect(200);
    expect(res1.body.profile.firstName).toBe('Stu');

    // Students can only update their contact information
    const res2 = await agent
      .put('/api/students/me')
      .send({ contact: { phone: '9876543210', address: 'New Address' } })
      .expect(200);
    expect(res2.body.profile.contact.phone).toBe('9876543210');
    expect(res2.body.profile.contact.address).toBe('New Address');
  });

  it('academic can create and list students', async () => {
    const pw = await hashPassword('pw');
    // Only administrative users can create students
    await User.create({ 
      email: 'a1@example.com', 
      passwordHash: pw, 
      role: 'academic',
      subRole: 'administrative',
      name: 'Admin User'
    });
    const agent = await loginAs('a1@example.com', 'pw', 'academic');

    await agent
      .post('/api/students')
      .send({ email: 's2@example.com', password: 'temp123', firstName: 'Stu', lastName: 'Dent' })
      .expect(201);

    const res = await agent.get('/api/students').expect(200);
    expect((res.body.students || []).length).toBeGreaterThan(0);
  });
});


