import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { AcademicNav } from '../components/AcademicNav';
import { api } from '../api/client';

export function AcademicProfile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.contact?.phone || '',
    address: user?.contact?.address || '',
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const { data } = await api.put('/auth/profile', {
        email: formData.email,
        name: formData.name,
        department: formData.department,
        contact: {
          phone: formData.phone,
          address: formData.address,
        },
      });
      setUser(data.user);
      setIsEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(null), 3000);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData({
      email: user?.email || '',
      name: user?.name || '',
      department: user?.department || '',
      phone: user?.contact?.phone || '',
      address: user?.contact?.address || '',
    });
    setIsEditing(false);
    setMsg(null);
  }

  return (
    <div className="page-container">
      <AcademicNav />
      <div className="content-area">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="form-banner">
            <h2 className="form-banner-title">My Profile</h2>
          </div>
          {user && (
            <div className="form-section">
              {!isEditing ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || user.email}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--teal-color)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        color: '#6c757d',
                        border: '3px solid #dee2e6',
                      }}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 style={{ margin: 0, fontSize: 24 }}>{user.name || 'User'}</h2>
                      {user.subRole && (
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: 14, textTransform: 'capitalize' }}>
                          {user.subRole.charAt(0).toUpperCase() + user.subRole.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  {user.name && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Name</label>
                      <div style={{ fontSize: 16, fontWeight: '500' }}>{user.name}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Email</label>
                    <div style={{ fontSize: 16, fontWeight: '500' }}>{user.email}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Role</label>
                    <div style={{ fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                  {user.subRole && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Sub-Role</label>
                      <div style={{ fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>
                        {user.subRole.charAt(0).toUpperCase() + user.subRole.slice(1)}
                      </div>
                    </div>
                  )}
                  {user.department && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Department</label>
                      <div style={{ fontSize: 16, fontWeight: '500' }}>{user.department}</div>
                    </div>
                  )}
                  {user.contact?.phone && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Phone Number</label>
                      <div style={{ fontSize: 16, fontWeight: '500' }}>{user.contact.phone}</div>
                    </div>
                  )}
                  {user.contact?.address && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: '#6c757d', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Address</label>
                      <div style={{ fontSize: 16, fontWeight: '500' }}>{user.contact.address}</div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                    style={{ marginTop: 24 }}
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Name</label>
                    <input
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Department</label>
                    <input
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Enter department"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Phone Number</label>
                    <input
                      className="form-control"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Address</label>
                    <textarea
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>
                  {msg && (
                    <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                      {msg}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
