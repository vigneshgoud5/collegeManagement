import type { Request, Response } from 'express';
import { loginService, refreshService, logoutService, hashPassword } from '../services/authService.js';
import { clearAuthCookies, setAuthCookies } from '../utils/tokens.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import bcrypt from 'bcrypt';

export async function login(req: Request, res: Response) {
  const { email, password, role } = req.body as {
    email: string;
    password: string;
    role: 'academic' | 'student';
  };

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password and role are required' });
  }

  try {
    // Add timeout protection for login (8 seconds - leave 2s buffer for Vercel's 10s limit)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Login operation timed out')), 8000)
    );

    const result = await Promise.race([
      loginService({ email, password, role }),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof loginService>>;

    if (!result.ok) {
      const status = result.code === 'ROLE_MISMATCH' ? 403 : 401;
      return res.status(status).json({ message: 'Invalid credentials', code: result.code });
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);
    return res.json({ user: result.user });
  } catch (error: any) {
    console.error('Login route error:', error);
    if (error.message === 'Login operation timed out') {
      return res.status(503).json({ 
        message: 'Service unavailable: Login operation timed out',
        code: 'TIMEOUT'
      });
    }
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

export async function register(req: Request, res: Response) {
  const { email, password, role, subRole, name, firstName, lastName, dob, contact, department, year, avatarUrl } = req.body as {
    email: string;
    password: string;
    role: 'academic' | 'student';
    subRole?: 'faculty' | 'administrative';
    name?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    contact?: { phone?: string; address?: string; city?: string; state?: string; zip?: string };
    department?: string;
    year?: number;
    avatarUrl?: string;
  };

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password and role are required' });
  }

  // For students, firstName and lastName are required
  if (role === 'student' && (!firstName || !lastName)) {
    return res.status(400).json({ message: 'firstName and lastName are required for students' });
  }

  // For academic users, subRole and name are required
  if (role === 'academic' && !subRole) {
    return res.status(400).json({ message: 'subRole (faculty or administrative) is required for academic users' });
  }
  if (role === 'academic' && !name) {
    return res.status(400).json({ message: 'name is required for academic users' });
  }

  try {
    // Add timeout protection for registration (8 seconds - leave 2s buffer for Vercel's 10s limit)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Registration operation timed out')), 8000)
    );

    const registerOperation = async () => {
      // Check if user already exists (use lean for faster query)
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        throw new Error('EMAIL_EXISTS');
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await User.create({ 
        email, 
        passwordHash, 
        role, 
        subRole: role === 'academic' ? subRole : undefined,
        name: role === 'academic' ? name : undefined,
        avatarUrl: role === 'academic' ? avatarUrl : undefined,
        department: role === 'academic' ? department : undefined,
        contact: role === 'academic' && contact ? { phone: contact.phone, address: contact.address } : undefined,
        status: 'active' 
      });

      // Create student profile if role is student
      let profile = null;
      if (role === 'student') {
        const dobDate = dob ? new Date(dob) : undefined;
        profile = await StudentProfile.create({
          user: user._id,
          firstName: firstName!,
          lastName: lastName!,
          dob: dobDate,
          contact: contact || {},
          department,
          year,
          avatarUrl,
        });
      }

      // Auto-login after registration (optimized loginService already uses lean)
      const loginResult = await loginService({ email, password, role });
      if (loginResult.ok) {
        setAuthCookies(res, loginResult.accessToken, loginResult.refreshToken);
      }

      return { user, profile, loginResult };
    };

    const result = await Promise.race([registerOperation(), timeoutPromise]) as Awaited<ReturnType<typeof registerOperation>>;

    return res.status(201).json({
      user: { 
        id: result.user.id, 
        email: result.user.email, 
        role: result.user.role, 
        subRole: result.user.subRole,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        department: result.user.department,
        contact: result.user.contact,
      },
      profile: result.profile,
      message: 'Registration successful',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    // Add timeout wrapper for refresh service (max 3 seconds)
    const refreshPromise = refreshService(token);
    const timeoutPromise = new Promise<{ ok: false; code: 'TIMEOUT' }>((resolve) => {
      setTimeout(() => resolve({ ok: false as const, code: 'TIMEOUT' as const }), 3000);
    });

    const result = await Promise.race([refreshPromise, timeoutPromise]);
    
    if (!result.ok) {
      clearAuthCookies(res);
      const status = result.code === 'TIMEOUT' ? 503 : 401;
      const message = result.code === 'TIMEOUT' 
        ? 'Service temporarily unavailable. Please try again.' 
        : 'Invalid refresh token';
      return res.status(status).json({ message, code: result.code });
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);
    return res.json({ user: result.user });
  } catch (error) {
    console.error('Refresh error:', error);
    clearAuthCookies(res);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  await logoutService();
  clearAuthCookies(res);
  return res.status(204).send();
}

export async function changePassword(req: Request, res: Response) {
  // Verify user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  // Fetch and verify user exists and is active
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify user is active
  if (user.status !== 'active') {
    return res.status(403).json({ message: 'Forbidden: Account is inactive' });
  }

  // Verify user can only change their own password
  if (user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden: Cannot change another user\'s password' });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid current password' });

  const saltRounds = 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  await user.save();
  return res.status(204).send();
}

export async function updateProfile(req: Request, res: Response) {
  // Verify user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  const userId = req.user.id;
  const { email, name, avatarUrl, department, contact } = req.body as { 
    email: string; 
    name?: string; 
    avatarUrl?: string; 
    department?: string;
    contact?: { phone?: string; address?: string };
  };
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Fetch and verify user exists and is active
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify user is active
  if (user.status !== 'active') {
    return res.status(403).json({ message: 'Forbidden: Account is inactive' });
  }

  // Verify user can only update their own profile
  if (user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden: Cannot update another user\'s profile' });
  }

  // Check if email is already taken by another user
  const existing = await User.findOne({ email, _id: { $ne: userId } });
  if (existing) return res.status(409).json({ message: 'Email already exists' });

  user.email = email.toLowerCase().trim();
  if (name !== undefined) user.name = name;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (department !== undefined) user.department = department;
  if (contact !== undefined) {
    user.contact = user.contact || {};
    if (contact.phone !== undefined) user.contact.phone = contact.phone;
    if (contact.address !== undefined) user.contact.address = contact.address;
  }
  await user.save();

  return res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      subRole: user.subRole,
      name: user.name,
      avatarUrl: user.avatarUrl,
      department: user.department,
      contact: user.contact,
    } 
  });
}
