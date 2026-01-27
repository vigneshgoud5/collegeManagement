import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStudent, getStudent, updateStudent } from '../api/adminStudents';
import { useNavigate, useParams } from 'react-router-dom';
import { AcademicNav } from '../components/AcademicNav';
import { useState, useEffect } from 'react';

export function StudentForm() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data } = useQuery({ queryKey: ['admin-student', id], queryFn: () => getStudent(id as string), enabled: isEdit });
	
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Use (data as any) for now, as data's type AdminStudent may not have avatarUrl.
		const avatar = (data as any)?.avatarUrl;
		if (avatar) {
			setAvatarPreview(avatar);
			setAvatarUrl(avatar);
		}
	}, [data]);


	const mutation = useMutation({
		mutationFn: async (payload: any) => {
			if (isEdit) return updateStudent(id as string, payload);
			return createStudent(payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-students'] });
			navigate('/academic/students');
		},
		onError: (err: any) => {
			let errorMessage = 'Failed to save student';
			if (err?.response?.data) {
				// Handle validation errors
				if (err.response.data.details && Array.isArray(err.response.data.details)) {
					errorMessage = err.response.data.details.map((d: any) => d.message).join(', ');
				} else if (err.response.data.message) {
					errorMessage = err.response.data.message;
				}
			} else if (err?.message) {
				errorMessage = err.message;
			}
			setError(errorMessage);
			console.error('Student save error:', err);
		},
	});

	function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				alert('Image size must be less than 5MB');
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setAvatarPreview(base64String);
				setAvatarUrl(base64String);
			};
			reader.readAsDataURL(file);
		}
	}


	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		const form = e.target as HTMLFormElement;
		const fd = new FormData(form);
		const payload: any = Object.fromEntries(fd.entries());
		
		if (!isEdit) {
			// For create we need email/password
			if (!payload.email || !payload.password) {
				setError('Email and password are required');
				return;
			}
			if (!payload.firstName || !payload.lastName) {
				setError('First name and last name are required');
				return;
			}
		}
		
		// Clean up payload: remove empty strings and convert to proper types
		if (payload.year && payload.year !== '') {
			const yearNum = Number(payload.year);
			payload.year = isNaN(yearNum) ? undefined : yearNum;
		} else {
			delete payload.year;
		}
		
		if (payload.department === '' || !payload.department) {
			delete payload.department;
		}
		
		if (avatarUrl && avatarUrl.trim() !== '') {
			payload.avatarUrl = avatarUrl;
		} else {
			delete payload.avatarUrl;
		}
		
		// Remove dob if empty
		if (!payload.dob || payload.dob === '') {
			delete payload.dob;
		}
		
		mutation.mutate(payload);
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<AcademicNav />
			<div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
				<h1>{isEdit ? 'Edit Student' : 'New Student'}</h1>
				<div style={{
					backgroundColor: 'white',
					borderRadius: 8,
					padding: 24,
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					marginTop: 24,
				}}>
					{error && (
						<div style={{
							backgroundColor: '#fee',
							border: '1px solid #fcc',
							borderRadius: 4,
							padding: 12,
							marginBottom: 16,
							color: '#c33',
						}}>
							{error}
						</div>
					)}
					<form onSubmit={onSubmit}>
						{!isEdit && (
							<>
								<div style={{ marginBottom: 16 }}>
									<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Email</label>
									<input name="email" type="email" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
								</div>
								<div style={{ marginBottom: 16 }}>
									<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Temporary Password</label>
									<input name="password" type="password" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
								</div>
							</>
						)}
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>First name</label>
							<input name="firstName" defaultValue={data?.firstName || ''} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
						</div>
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Last name</label>
							<input name="lastName" defaultValue={data?.lastName || ''} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
						</div>
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Department</label>
							<input name="department" defaultValue={data?.department || ''} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
						</div>
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Year</label>
							<input name="year" type="number" defaultValue={data?.year || ''} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
						</div>
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Profile Photo</label>
							{avatarPreview && (
								<div style={{ marginBottom: 12, textAlign: 'center' }}>
									<img
										src={avatarPreview}
										alt="Avatar preview"
										style={{
											width: 120,
											height: 120,
											borderRadius: '50%',
											objectFit: 'cover',
											border: '2px solid #ddd',
										}}
									/>
								</div>
							)}
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
							/>
						</div>
						<button 
							disabled={mutation.isPending} 
							type="submit" 
							style={{ 
								marginTop: 12,
								padding: '12px 24px',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								borderRadius: 4,
								cursor: mutation.isPending ? 'not-allowed' : 'pointer',
								fontSize: 16,
								width: '100%',
							}}
						>
							{mutation.isPending ? 'Saving...' : 'Save'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
