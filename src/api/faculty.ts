import { api } from './client';

export type Faculty = {
  _id: string;
  email: string;
  role: 'academic';
  subRole?: 'faculty' | 'administrative';
  name?: string;
  department?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
};

export async function listFaculty(params: { department?: string; q?: string } = {}) {
  const { data } = await api.get('/faculty', { params });
  return data.faculty as Faculty[];
}

export async function getFaculty(id: string) {
  const { data } = await api.get(`/faculty/${id}`);
  return data.faculty as Faculty;
}

export async function createFaculty(payload: {
  email: string;
  password: string;
  subRole: 'faculty' | 'administrative';
  name: string;
  department?: string;
  avatarUrl?: string;
}) {
  const { data } = await api.post('/faculty', payload);
  return data.faculty as Faculty;
}

export async function updateFaculty(id: string, update: Partial<Faculty>) {
  const { data } = await api.put(`/faculty/${id}`, update);
  return data.faculty as Faculty;
}

export async function setFacultyStatus(id: string, status: 'active' | 'inactive') {
  await api.patch(`/faculty/${id}/status`, { status });
}

export async function deleteFaculty(id: string) {
  await api.delete(`/faculty/${id}`);
}

