import { api } from './client';

export type AdminStudent = {
	_id: string;
	user?: { email: string; status: 'active' | 'inactive'; role: 'student' };
	firstName: string;
	lastName: string;
	department?: string;
	year?: number;
};

export async function listStudents(params: { department?: string; year?: number; q?: string } = {}) {
	const { data } = await api.get('/students', { params });
	return data.students as AdminStudent[];
}

export async function getStudent(id: string) {
	const { data } = await api.get(`/students/${id}`);
	return data.profile as AdminStudent;
}

export async function createStudent(payload: {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	department?: string;
	year?: number;
	avatarUrl?: string;
}) {
	const { data } = await api.post('/students', payload);
	return data;
}

export async function updateStudent(id: string, update: Partial<AdminStudent>) {
	const { data } = await api.put(`/students/${id}`, update);
	return data.profile as AdminStudent;
}

export async function setStudentStatus(id: string, status: 'active' | 'inactive') {
	await api.patch(`/students/${id}/status`, { status });
}

export async function deleteStudent(id: string) {
	await api.delete(`/students/${id}`);
}


