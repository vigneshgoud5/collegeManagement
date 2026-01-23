import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listStudents, setStudentStatus, deleteStudent } from '../api/adminStudents';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AcademicNav } from '../components/AcademicNav';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useAuthStore } from '../store/auth';

export function StudentsList() {
	const qc = useQueryClient();
	const { user } = useAuthStore();
	const isAdministrator = user?.subRole === 'administrative';
	const [q, setQ] = useState('');
	const [department, setDepartment] = useState('');
	const [year, setYear] = useState('');
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
		isOpen: false,
		id: '',
		name: '',
	});
	
	const { data: students, isLoading } = useQuery({ 
		queryKey: ['admin-students', { q, department, year }], 
		queryFn: () => listStudents({ 
			q: q || undefined, 
			department: department || undefined, 
			year: year ? Number(year) : undefined 
		}) 
	});
	
	const toggle = useMutation({
		mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => setStudentStatus(id, status),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-students'] }),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteStudent(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-students'] });
			setDeleteModal({ isOpen: false, id: '', name: '' });
		},
	});

	function handleDeleteClick(id: string, name: string) {
		setDeleteModal({ isOpen: true, id, name });
	}

	function handleConfirmDelete() {
		if (deleteModal.id) {
			deleteMutation.mutate(deleteModal.id);
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<AcademicNav />
			<div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
					<h1 style={{ margin: 0 }}>View All Students</h1>
					{isAdministrator && (
						<Link
							to="/academic/students/new"
							style={{
								padding: '10px 20px',
								backgroundColor: '#007bff',
								color: 'white',
								textDecoration: 'none',
								borderRadius: 4,
								fontWeight: '500',
							}}
						>
							+ New Student
						</Link>
					)}
				</div>

				{/* Search and Filter Section */}
				<div style={{
					backgroundColor: 'white',
					borderRadius: 8,
					padding: 20,
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					marginBottom: 24,
				}}>
					<h3 style={{ marginTop: 0, marginBottom: 16 }}>Search and Filter Students</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: '500' }}>Search by Name</label>
							<input 
								type="text"
								placeholder="Enter student name..."
								value={q} 
								onChange={(e) => setQ(e.target.value)}
								style={{
									width: '100%',
									padding: '8px 12px',
									borderRadius: 4,
									border: '1px solid #ddd',
									fontSize: 14,
								}}
							/>
						</div>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: '500' }}>Department</label>
							<input 
								type="text"
								placeholder="e.g., CSE, ECE..."
								value={department} 
								onChange={(e) => setDepartment(e.target.value)}
								style={{
									width: '100%',
									padding: '8px 12px',
									borderRadius: 4,
									border: '1px solid #ddd',
									fontSize: 14,
								}}
							/>
						</div>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: '500' }}>Year</label>
							<select
								value={year}
								onChange={(e) => setYear(e.target.value)}
								style={{
									width: '100%',
									padding: '8px 12px',
									borderRadius: 4,
									border: '1px solid #ddd',
									fontSize: 14,
								}}
							>
								<option value="">All Years</option>
								<option value="1">Year 1</option>
								<option value="2">Year 2</option>
								<option value="3">Year 3</option>
								<option value="4">Year 4</option>
								<option value="5">Year 5</option>
							</select>
						</div>
						<div style={{ display: 'flex', alignItems: 'flex-end' }}>
							<button
								onClick={() => {
									setQ('');
									setDepartment('');
									setYear('');
								}}
								style={{
									padding: '8px 16px',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: 4,
									cursor: 'pointer',
									fontSize: 14,
									width: '100%',
								}}
							>
								Clear Filters
							</button>
						</div>
					</div>
				</div>

				{/* Students Table */}
				<div style={{
					backgroundColor: 'white',
					borderRadius: 8,
					padding: 20,
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					overflowX: 'auto',
				}}>
					{isLoading ? (
						<div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
					) : students && students.length > 0 ? (
						<table width="100%" cellPadding={12} style={{ borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ borderBottom: '2px solid #dee2e6' }}>
									<th align="left" style={{ paddingBottom: 12 }}>Name</th>
									<th align="left" style={{ paddingBottom: 12 }}>Email</th>
									<th align="left" style={{ paddingBottom: 12 }}>Department</th>
									<th align="left" style={{ paddingBottom: 12 }}>Year</th>
									<th align="left" style={{ paddingBottom: 12 }}>Status</th>
									<th align="left" style={{ paddingBottom: 12 }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{students.map((s) => (
									<tr key={s._id} style={{ borderBottom: '1px solid #dee2e6' }}>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>
											<Link 
												to={`/academic/students/${s._id}`}
												style={{ 
													color: '#007bff', 
													textDecoration: 'none',
													fontWeight: '500',
												}}
											>
												{s.firstName} {s.lastName}
											</Link>
										</td>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>{(s as any).user?.email || '-'}</td>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>{s.department || '-'}</td>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>{s.year || '-'}</td>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>
											<span style={{
												padding: '4px 8px',
												borderRadius: 4,
												fontSize: 12,
												fontWeight: '500',
												backgroundColor: s.user?.status === 'active' ? '#d4edda' : '#f8d7da',
												color: s.user?.status === 'active' ? '#155724' : '#721c24',
											}}>
												{s.user?.status || '-'}
											</span>
										</td>
										<td style={{ paddingTop: 12, paddingBottom: 12 }}>
											<button 
												onClick={() => toggle.mutate({ id: s._id, status: s.user?.status === 'active' ? 'inactive' : 'active' })}
												style={{
													padding: '4px 12px',
													marginRight: isAdministrator ? 8 : 0,
													backgroundColor: s.user?.status === 'active' ? '#dc3545' : '#28a745',
													color: 'white',
													border: 'none',
													borderRadius: 4,
													cursor: 'pointer',
													fontSize: 12,
												}}
											>
												{s.user?.status === 'active' ? 'Deactivate' : 'Activate'}
											</button>
											{isAdministrator && (
												<>
													<Link 
														to={`/academic/students/${s._id}/edit`}
														style={{ 
															color: '#007bff', 
															textDecoration: 'none',
															fontSize: 14,
															marginRight: 8,
														}}
													>
														Edit
													</Link>
													<button
														onClick={() => handleDeleteClick(s._id, `${s.firstName} ${s.lastName}`)}
														disabled={deleteMutation.isPending}
														style={{
															padding: '4px 12px',
															backgroundColor: '#dc3545',
															color: 'white',
															border: 'none',
															borderRadius: 4,
															cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
															fontSize: 12,
														}}
														title="Delete student"
													>
														Delete
													</button>
												</>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
							No students found. {q || department || year ? 'Try adjusting your filters.' : 'No students registered yet.'}
						</div>
					)}
				</div>
			</div>
			<ConfirmDeleteModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
				onConfirm={handleConfirmDelete}
				title="Delete Student"
				message="Are you sure you want to delete this student?"
				itemName={deleteModal.name}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	);
}
