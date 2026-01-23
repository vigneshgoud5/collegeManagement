import { Link } from 'react-router-dom';
import { StudentNav } from '../components/StudentNav';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/students';
import { useAuthStore } from '../store/auth';

export function DashboardStudent() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'lightblue' }}>
      <StudentNav />
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto'}}>
        <h1 style={{padding: '10px 20px',backgroundColor: 'lightgreen'}}>Student Dashboard</h1>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : profile ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginTop: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #007bff',
                  }}
                />
              )}
              <div>
                <h2 style={{ margin: 0 }}>Welcome, {profile.firstName} {profile.lastName}!</h2>
                {!profile.avatarUrl && (
                  <p style={{ color: '#6c757d', marginTop: 4, fontSize: 14 }}>
                    Add a profile photo in your profile settings
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
              <div style={{ padding: 16, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <strong>Email:</strong> {user?.email || 'N/A'}
              </div>
              
              {profile.department && (
                <div style={{ padding: 16, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <strong>Department:</strong> {profile.department}
                </div>
              )}
              
              {profile.year && (
                <div style={{ padding: 16, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <strong>Year:</strong> {profile.year}
                </div>
              )}
              
              {profile.contact?.phone && (
                <div style={{ padding: 16, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <strong>Phone:</strong> {profile.contact.phone}
                </div>
              )}
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link
                to="/student/profile"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 4,
                  display: 'inline-block',
                }}
              >
                View/Edit Profile
              </Link>
              <Link
                to="/student/settings"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 4,
                  display: 'inline-block',
                }}
              >
                Change Password
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginTop: 24,
          }}>
            <p>No profile found. Please complete your profile.</p>
            <Link
              to="/student/profile"
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 4,
                display: 'inline-block',
                marginTop: 16,
              }}
            >
              Create Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
