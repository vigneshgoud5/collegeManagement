import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFaculty, deleteFaculty } from '../api/faculty';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AcademicNav } from '../components/AcademicNav';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useAuthStore } from '../store/auth';
import { useState } from 'react';

export function FacultyDetail() {
  const params = useParams();
  const id = params.id as string;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdministrator = user?.subRole === 'administrative';
  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ['faculty', id],
    queryFn: () => getFaculty(id),
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFaculty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      navigate('/academic/faculty');
    },
  });

  function handleDeleteClick() {
    if (String(id) === String(user?.id)) {
      alert('Cannot delete your own account');
      return;
    }
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(id);
  }

  if (isLoading)
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <AcademicNav />
        <div style={{ padding: 24 }}>Loading...</div>
      </div>
    );
  if (error || !faculty)
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <AcademicNav />
        <div style={{ padding: 24 }}>Not found</div>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AcademicNav />
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>{faculty.name || faculty.email}</h1>
          {isAdministrator && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to={`/academic/faculty/${id}/edit`}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 4,
                  fontWeight: '500',
                }}
              >
                Edit Faculty
              </Link>
              <button
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending || String(id) === String(user?.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: '500',
                  cursor: (deleteMutation.isPending || String(id) === String(user?.id)) ? 'not-allowed' : 'pointer',
                  opacity: (deleteMutation.isPending || String(id) === String(user?.id)) ? 0.5 : 1,
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Faculty'}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            {faculty.avatarUrl ? (
              <img
                src={faculty.avatarUrl}
                alt={faculty.email}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #007bff',
                }}
              />
            ) : (
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: '#6c757d',
                border: '3px solid #dee2e6',
              }}>
                {(faculty.name || faculty.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>{faculty.name || faculty.email}</h2>
              {faculty.subRole && (
                <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: 14, textTransform: 'capitalize' }}>
                  {faculty.subRole.charAt(0).toUpperCase() + faculty.subRole.slice(1)}
                </p>
              )}
            </div>
          </div>
          {faculty.name && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Name</label>
              <div style={{ fontSize: 16, fontWeight: '500' }}>{faculty.name}</div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Email</label>
            <div style={{ fontSize: 16, fontWeight: '500' }}>{faculty.email}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Role</label>
            <div style={{ fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>{faculty.role}</div>
          </div>
          {faculty.subRole && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Sub-Role</label>
              <div style={{ fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>
                {faculty.subRole.charAt(0).toUpperCase() + faculty.subRole.slice(1)}
              </div>
            </div>
          )}
          {faculty.department && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Department</label>
              <div style={{ fontSize: 16, fontWeight: '500' }}>{faculty.department}</div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Status</label>
            <span style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: '500',
              backgroundColor: faculty.status === 'active' ? '#d4edda' : '#f8d7da',
              color: faculty.status === 'active' ? '#155724' : '#721c24',
            }}>
              {faculty.status}
            </span>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Faculty"
        message="Are you sure you want to delete this faculty member?"
        itemName={faculty ? (faculty.name || faculty.email) : ''}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

