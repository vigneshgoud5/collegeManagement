import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { hashPassword } from '../services/authService.js';

export async function listStudents(req: Request, res: Response) {
  const { department, year, q } = req.query as { department?: string; year?: string; q?: string };
  const userFilter = { role: 'student' } as const;

  const profileFilter: Record<string, unknown> = {};
  if (department) profileFilter.department = department;
  if (year) profileFilter.year = Number(year);
  if (q) {
    profileFilter.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ];
  }

  const students = await StudentProfile.find(profileFilter).populate({ path: 'user', match: userFilter, select: 'email status role' });
  const filtered = students.filter((s) => (s as any).user); // drop profiles without active student user
  return res.json({ students: filtered });
}

export async function getStudent(req: Request, res: Response) {
  const { id } = req.params;
  const profile = await StudentProfile.findById(id).populate({ path: 'user', select: 'email status role' });
  if (!profile) return res.status(404).json({ message: 'Not found' });
  return res.json({ profile });
}

export async function createStudent(req: Request, res: Response) {
  const { email, password, firstName, lastName, dob, contact, department, year, avatarUrl } = req.body ?? {};
  try {
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields: email, password, firstName, and lastName are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role: 'student', status: 'active' });
    const profile = await StudentProfile.create({ user: user._id, firstName, lastName, dob, contact, department, year, avatarUrl });
    
    return res.status(201).json({ 
      user: { id: user.id, email: user.email, role: user.role }, 
      profile 
    });
  } catch (error: any) {
    console.error('Create student error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function updateStudent(req: Request, res: Response) {
  // Verify user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // Verify user is active
  const adminUser = await User.findById(req.user.id);
  if (!adminUser || adminUser.status !== 'active') {
    return res.status(403).json({ message: 'Forbidden: Account is inactive' });
  }

  const { id } = req.params;
  const { firstName, lastName, dob, contact, department, year, avatarUrl } = req.body ?? {};
  const profile = await StudentProfile.findByIdAndUpdate(
    id,
    { $set: { firstName, lastName, dob, contact, department, year, avatarUrl } },
    { new: true, runValidators: true }
  );
  if (!profile) return res.status(404).json({ message: 'Not found' });
  return res.json({ profile });
}

export async function toggleStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: 'active' | 'inactive' };
  if (!status) return res.status(400).json({ message: 'Missing status' });

  const profile = await StudentProfile.findById(id);
  if (!profile) return res.status(404).json({ message: 'Not found' });
  await User.findByIdAndUpdate(profile.user, { status });
  return res.status(204).send();
}

export async function softDeleteStudent(req: Request, res: Response) {
  const { id } = req.params;
  const profile = await StudentProfile.findById(id);
  if (!profile) return res.status(404).json({ message: 'Not found' });
  await User.findByIdAndUpdate(profile.user, { status: 'inactive' });
  return res.status(204).send();
}

export async function deleteStudent(req: Request, res: Response) {
  const { id } = req.params;
  const profile = await StudentProfile.findById(id);
  if (!profile) return res.status(404).json({ message: 'Not found' });
  
  // Delete the user and profile
  await User.findByIdAndDelete(profile.user);
  await StudentProfile.findByIdAndDelete(id);
  
  return res.status(204).send();
}


