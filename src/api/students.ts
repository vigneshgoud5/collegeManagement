import { api } from './client';

export type StudentProfile = {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  dob?: string;
  contact?: { phone?: string; address?: string; city?: string; state?: string; zip?: string };
  department?: string;
  year?: number;
  avatarUrl?: string;
};

export async function getMyProfile(): Promise<StudentProfile> {
  const { data } = await api.get('/students/me');
  return data.profile;
}

export async function updateMyProfile(contact: { phone?: string; address?: string; city?: string; state?: string; zip?: string }): Promise<StudentProfile> {
  const { data } = await api.put('/students/me', { contact });
  return data.profile;
}

export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/students/me/password', { currentPassword, newPassword });
}


