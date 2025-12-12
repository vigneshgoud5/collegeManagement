import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateMyProfile } from '../api/students';
import { StudentNav } from '../components/StudentNav';
import { useState } from 'react';

export function StudentProfile() {
  const qc = useQueryClient();
  const { data: profile, isLoading, error } = useQuery({ queryKey: ['me'], queryFn: getMyProfile });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contact, setContact] = useState<{ phone?: string; address?: string; city?: string; state?: string; zip?: string }>({});
  const [msg, setMsg] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setIsEditingContact(false);
      setMsg('Contact information updated successfully!');
      setTimeout(() => setMsg(null), 3000);
    },
    onError: (error: any) => {
      setMsg(error?.response?.data?.message || 'Update failed');
      setTimeout(() => setMsg(null), 3000);
    },
  });

  function startEditing() {
    setContact(profile?.contact || {});
    setIsEditingContact(true);
    setMsg(null);
  }

  function cancelEditing() {
    setIsEditingContact(false);
    setContact({});
    setMsg(null);
  }

  function handleSave() {
    updateMutation.mutate(contact);
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <StudentNav />
      <div style={{ padding: 24 }}>Loading...</div>
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <StudentNav />
      <div style={{ padding: 24 }}>Failed to load.</div>
    </div>
  );
  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <StudentNav />
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>My Profile</h1>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 8,
          padding: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: 24,
          border: `1px solid var(--border-color)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
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
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>{profile.firstName} {profile.lastName}</h2>
              {profile.department && (
                <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: 14 }}>
                  {profile.department}
                </p>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>First Name</label>
            <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.firstName}</div>
          </div>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Last Name</label>
            <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.lastName}</div>
          </div>
          {profile.dob && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Date of Birth</label>
              <div style={{ fontSize: 16, fontWeight: '500' }}>{new Date(profile.dob).toLocaleDateString()}</div>
            </div>
          )}
          {profile.department && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Department</label>
              <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.department}</div>
            </div>
          )}
          {profile.year && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Year</label>
              <div style={{ fontSize: 16, fontWeight: '500' }}>Year {profile.year}</div>
            </div>
          )}
          <fieldset style={{ marginTop: 24, padding: 16, border: '1px solid #dee2e6', borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <legend style={{ fontWeight: 'bold', color: '#495057', padding: '0 8px' }}>Contact Information</legend>
              {!isEditingContact && (
                <button
                  onClick={startEditing}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Edit Contact
                </button>
              )}
            </div>
            {msg && (
              <div style={{
                marginBottom: 16,
                padding: 8,
                borderRadius: 4,
                backgroundColor: msg.includes('successfully') ? '#d4edda' : '#f8d7da',
                color: msg.includes('successfully') ? '#155724' : '#721c24',
                fontSize: 14,
              }}>
                {msg}
              </div>
            )}
            {isEditingContact ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Phone</label>
                  <input
                    type="text"
                    value={contact.phone || ''}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                    placeholder="Enter phone number"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Address</label>
                  <input
                    type="text"
                    value={contact.address || ''}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                    placeholder="Enter address"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>City</label>
                  <input
                    type="text"
                    value={contact.city || ''}
                    onChange={(e) => setContact({ ...contact, city: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                    placeholder="Enter city"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>State</label>
                  <input
                    type="text"
                    value={contact.state || ''}
                    onChange={(e) => setContact({ ...contact, state: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                    placeholder="Enter state"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>ZIP</label>
                  <input
                    type="text"
                    value={contact.zip || ''}
                    onChange={(e) => setContact({ ...contact, zip: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={updateMutation.isPending}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {profile.contact?.phone && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Phone</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.contact.phone}</div>
                  </div>
                )}
                {profile.contact?.address && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>Address</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.contact.address}</div>
                  </div>
                )}
                {profile.contact?.city && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>City</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.contact.city}</div>
                  </div>
                )}
                {profile.contact?.state && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>State</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.contact.state}</div>
                  </div>
                )}
                {profile.contact?.zip && (
                  <div>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4 }}>ZIP</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{profile.contact.zip}</div>
                  </div>
                )}
                {!profile.contact?.phone && !profile.contact?.address && !profile.contact?.city && !profile.contact?.state && !profile.contact?.zip && (
                  <div style={{ color: '#6c757d', fontSize: 14, fontStyle: 'italic' }}>No contact information available. Click "Edit Contact" to add.</div>
                )}
              </>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
