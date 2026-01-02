import { useState } from 'react';
import { changeMyPassword } from '../api/students';
import { StudentNav } from '../components/StudentNav';
import { PasswordInput } from '../components/PasswordInput';

export function Settings() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setMsg('Password changed successfully!');
      setCurrent('');
      setNewPass('');
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Change failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <StudentNav />
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' ,backgroundColor: 'lightblue'}}>
        <h2 style={{backgroundColor: 'lightgreen',padding: '10px 20px'}}>Change Password</h2>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: 24,
        }}>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrent(e.target.value)}
                required
                placeholder="Enter current password"
                label="Current Password"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPass(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
                label="New Password"
                className="form-control"
              />
            </div>
            <button
              disabled={saving}
              type="submit"
              style={{
                marginTop: 12,
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 16,
                width: '100%',
              }}
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
            {msg && (
              <p style={{
                marginTop: 12,
                color: msg.includes('successfully') ? 'green' : 'red',
                padding: 8,
                backgroundColor: msg.includes('successfully') ? '#d4edda' : '#f8d7da',
                borderRadius: 4,
              }}>
                {msg}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
