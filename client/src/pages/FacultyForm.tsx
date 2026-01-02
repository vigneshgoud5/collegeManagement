import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFaculty, getFaculty, updateFaculty } from '../api/faculty';
import { useNavigate, useParams } from 'react-router-dom';
import { AcademicNav } from '../components/AcademicNav';
import { useState, useEffect } from 'react';

export function FacultyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['faculty', id],
    queryFn: () => getFaculty(id as string),
    enabled: isEdit,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.avatarUrl) {
      setAvatarPreview(data.avatarUrl);
      setAvatarUrl(data.avatarUrl);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) return updateFaculty(id as string, payload);
      return createFaculty(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty'] });
      navigate('/academic/faculty');
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to save faculty';
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
      console.error('Faculty save error:', err);
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
      if (!payload.email || !payload.password || !payload.subRole || !payload.name) {
        setError('Email, password, sub-role, and name are required');
        return;
      }
    }
    
    payload.avatarUrl = avatarUrl || undefined;
    if (!payload.department || payload.department === '') payload.department = undefined;
    
    mutation.mutate(payload);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AcademicNav />
      <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <h1>{isEdit ? 'Edit Faculty' : 'New Faculty'}</h1>
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
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Name</label>
              <input name="name" defaultValue={data?.name || ''} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Sub-Role</label>
              <select
                name="subRole"
                defaultValue={data?.subRole || ''}
                required
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">Select sub-role</option>
                <option value="faculty">Faculty</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Department</label>
              <input name="department" defaultValue={data?.department || ''} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
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

