import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

export async function loginService(params: {
  email: string;
  password: string;
  role: 'academic' | 'student';
}) {
  const { email, password, role } = params;

  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') {
    return { ok: false as const, code: 'INVALID_CREDENTIALS' };
  }

  if (user.role !== role) {
    return { ok: false as const, code: 'ROLE_MISMATCH' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, code: 'INVALID_CREDENTIALS' };
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  return {
        ok: true as const,
    user: {
          id: user.id, 
      email: user.email,
      role: user.role,
          subRole: user.subRole,
          name: user.name,
          avatarUrl: user.avatarUrl,
          department: user.department,
          contact: user.contact,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshService(token: string) {
  const payload = verifyRefreshToken(token);
  if (!payload || payload.type !== 'refresh') {
    return { ok: false as const, code: 'INVALID_REFRESH' };
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active') {
    return { ok: false as const, code: 'INVALID_REFRESH' };
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);
  return {
        ok: true as const,
    user: {
          id: user.id, 
      email: user.email,
      role: user.role,
          subRole: user.subRole,
          name: user.name,
          avatarUrl: user.avatarUrl,
          department: user.department,
          contact: user.contact,
        },
        accessToken,
        refreshToken,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function logoutService() {
  return { ok: true as const };
}

