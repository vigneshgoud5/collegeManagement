import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudent, deleteStudent } from '../api/adminStudents';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AcademicNav } from '../components/AcademicNav';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useAuthStore } from '../store/auth';
import { useState } from 'react';

export function StudentDetail() {
	const params = useParams();
	const id = params.id as string;
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { user } = useAuthStore();
	const isAdministrator = user?.subRole === 'administrative';
	const { data: profile, isLoading, error } = useQuery({ queryKey: ['admin-student', id], queryFn: () => getStudent(id) });

	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteStudent(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-students'] });
			navigate('/academic/students');
		},
	});

	function handleDeleteClick() {
		setShowDeleteModal(true);
	}

	function handleConfirmDelete() {
		deleteMutation.mutate(id);
	}

	if (isLoading) return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<AcademicNav />
			<div style={{ padding: 24 }}>Loading...</div>
		</div>
	);
	if (error || !profile) return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<AcademicNav />
			<div style={{ padding: 24 }}>Not found</div>
		</div>
	);

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<AcademicNav />
			<div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,backgroundColor: 'rgb(171, 227, 231)' }}>
					<h1 style={{ margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
					{isAdministrator && (
						<div style={{ display: 'flex', gap: 8 }}>
							<Link
								to={`/academic/students/${id}/edit`}
								style={{
									padding: '10px 20px',
									backgroundColor: '#007bff',
									color: 'white',
									textDecoration: 'none',
									borderRadius: 4,
									fontWeight: '500',
								}}
							>
								Edit Student
							</Link>
							<button
								onClick={handleDeleteClick}
								disabled={deleteMutation.isPending}
								style={{
									padding: '10px 20px',
									backgroundColor: '#dc3545',
									color: 'white',
									border: 'none',
									borderRadius: 4,
									fontWeight: '500',
									cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
								}}
							>
								{deleteMutation.isPending ? 'Deleting...' : 'Delete Student'}
							</button>
						</div>
					)}
				</div>
				<div style={{
					backgroundColor: 'white',
					borderRadius: 8,
					padding: 24,
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					marginTop: 24,
				}}>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Email</label>
						<div style={{ fontSize: 16, fontWeight: '500' }}>{(profile as any).user?.email || '-'}</div>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Department</label>
						<div style={{ fontSize: 16, fontWeight: '500' }}>{profile.department || '-'}</div>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Year</label>
						<div style={{ fontSize: 16, fontWeight: '500' }}>{profile.year || '-'}</div>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Status</label>
						<span style={{
							padding: '4px 8px',
							borderRadius: 4,
							fontSize: 14,
							fontWeight: '500',
							backgroundColor: (profile as any).user?.status === 'active' ? '#d4edda' : '#f8d7da',
							color: (profile as any).user?.status === 'active' ? '#155724' : '#721c24',
						}}>
							{(profile as any).user?.status || '-'}
						</span>
					</div>
				</div>
			</div>
			<ConfirmDeleteModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Student"
				message="Are you sure you want to delete this student?"
				itemName={profile ? `${profile.firstName} ${profile.lastName}` : ''}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	);
}
