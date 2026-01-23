import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listFaculty, setFacultyStatus, deleteFaculty } from '../api/faculty';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AcademicNav } from '../components/AcademicNav';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useAuthStore } from '../store/auth';

export function FacultyList() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdministrator = user?.subRole === 'administrative';
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const { data: faculty, isLoading } = useQuery({
    queryKey: ['faculty', { q, department }],
    queryFn: () => listFaculty({
      q: q || undefined,
      department: department || undefined,
    }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => setFacultyStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFaculty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      setDeleteModal({ isOpen: false, id: '', name: '' });
    },
  });

  function handleDeleteClick(id: string, name: string) {
    if (String(id) === String(user?.id)) {
      alert('Cannot delete your own account');
      return;
    }
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
          <h1 style={{ margin: 0 }}>View All Faculty</h1>
          {isAdministrator && (
            <Link
              to="/academic/faculty/new"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 4,
                fontWeight: '500',
              }}
            >
              + New Faculty
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
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Search and Filter Faculty</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: '500' }}>Search by Name or Email</label>
              <input
                type="text"
                placeholder="Enter name or email..."
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
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setQ('');
                  setDepartment('');
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

        {/* Faculty Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflowX: 'auto',
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
          ) : faculty && faculty.length > 0 ? (
            <table width="100%" cellPadding={12} style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th align="left" style={{ paddingBottom: 12 }}>Name</th>
                  <th align="left" style={{ paddingBottom: 12 }}>Email</th>
                  <th align="left" style={{ paddingBottom: 12 }}>Sub-Role</th>
                  <th align="left" style={{ paddingBottom: 12 }}>Department</th>
                  <th align="left" style={{ paddingBottom: 12 }}>Status</th>
                  <th align="left" style={{ paddingBottom: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((f) => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <Link
                        to={`/academic/faculty/${f._id}`}
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontWeight: '500',
                        }}
                      >
                        {f.name || f.email}
                      </Link>
                    </td>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>{f.email}</td>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: '500',
                        backgroundColor: f.subRole === 'administrative' ? '#cfe2ff' : '#e7f3ff',
                        color: f.subRole === 'administrative' ? '#084298' : '#055160',
                        textTransform: 'capitalize',
                      }}>
                        {f.subRole || '-'}
                      </span>
                    </td>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>{f.department || '-'}</td>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: '500',
                        backgroundColor: f.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: f.status === 'active' ? '#155724' : '#721c24',
                      }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ paddingTop: 12, paddingBottom: 12 }}>
                      {isAdministrator && (
                        <>
                          <button
                            onClick={() => toggle.mutate({ id: f._id, status: f.status === 'active' ? 'inactive' : 'active' })}
                            disabled={String(f._id) === String(user?.id)}
                            style={{
                              padding: '4px 12px',
                              marginRight: 8,
                              backgroundColor: f.status === 'active' ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: String(f._id) === String(user?.id) ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                              opacity: String(f._id) === String(user?.id) ? 0.5 : 1,
                            }}
                            title={String(f._id) === String(user?.id) ? 'Cannot change your own status' : ''}
                          >
                            {f.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link
                            to={`/academic/faculty/${f._id}/edit`}
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
                            onClick={() => handleDeleteClick(f._id, f.name || f.email)}
                            disabled={deleteMutation.isPending || String(f._id) === String(user?.id)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: (deleteMutation.isPending || String(f._id) === String(user?.id)) ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                              opacity: (deleteMutation.isPending || String(f._id) === String(user?.id)) ? 0.5 : 1,
                            }}
                            title={String(f._id) === String(user?.id) ? 'Cannot delete your own account' : 'Delete faculty'}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {!isAdministrator && (
                        <span style={{ color: '#6c757d', fontSize: 14 }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
              No faculty found. {q || department ? 'Try adjusting your filters.' : 'No faculty registered yet.'}
            </div>
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Faculty"
        message="Are you sure you want to delete this faculty member?"
        itemName={deleteModal.name}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

