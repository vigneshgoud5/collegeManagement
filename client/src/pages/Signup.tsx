import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { AuthHeader } from '../components/AuthHeader';
import { PasswordInput } from '../components/PasswordInput';

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'academic' | 'student',
    subRole: '' as 'faculty' | 'administrative' | '',
    name: '',
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    department: '',
    year: '',
    avatarUrl: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, avatarUrl: base64String });
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  }


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'student' && (!formData.firstName || !formData.lastName)) {
      setError('First name and last name are required for students');
      return;
    }

    if (formData.role === 'academic' && !formData.subRole) {
      setError('Please select a sub-role (Faculty or Administrative)');
      return;
    }

    if (formData.role === 'academic' && !formData.name) {
      setError('Name is required for academic users');
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        subRole: formData.role === 'academic' ? (formData.subRole as 'faculty' | 'administrative') : undefined,
        name: formData.role === 'academic' ? formData.name : undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob || undefined,
        contact: formData.phone ? { phone: formData.phone } : undefined,
        department: formData.department || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });

      const to = user.role === 'academic' ? '/dashboard/academic' : '/dashboard/student';
      navigate(to, { replace: true });
    } catch (err: any) {
      let errorMessage = 'Registration failed';
      
      if (err?.response?.data) {
        // Handle validation errors with details
        if (err.response.data.details && Array.isArray(err.response.data.details) && err.response.data.details.length > 0) {
          // Format validation errors: "Field: Message" for each error
          const errorMessages = err.response.data.details.map((detail: any) => {
            const field = detail.field || detail.param || 'Field';
            const message = detail.message || detail.msg || 'Invalid value';
            // Capitalize first letter and format field name (e.g., "firstName" -> "First Name")
            const formattedField = field
              .charAt(0)
              .toUpperCase() + 
              field.slice(1)
                .replace(/([A-Z])/g, ' $1')
                .replace(/Id/g, 'ID')
                .replace(/Url/g, 'URL')
                .replace(/Dob/g, 'Date of Birth');
            return `• ${formattedField}: ${message}`;
          });
          errorMessage = 'Please fix the following errors:\n' + errorMessages.join('\n');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <AuthHeader />
        <div className="auth-header">
          <h2 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p className="auth-subtitle">Register for a new account</p>
        </div>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Role <span style={{ color: 'red' }}>*</span>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any, subRole: '' })}
              style={{ width: '100%', padding: 8 }}
              required
            >
              <option value="student">Student</option>
              <option value="academic">Academic</option>
            </select>
          </label>
        </div>

        {formData.role === 'academic' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>
                Name <span style={{ color: 'red' }}>*</span>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8 }}
                  placeholder="Enter your full name"
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Sub-Role <span style={{ color: 'red' }}>*</span>
                <select
                  value={formData.subRole}
                  onChange={(e) => setFormData({ ...formData, subRole: e.target.value as any })}
                  style={{ width: '100%', padding: 8 }}
                  required
                >
                  <option value="">Select sub-role</option>
                  <option value="faculty">Faculty</option>
                  <option value="administrative">Administrative</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Department
                <input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Profile Photo
                <div style={{ marginTop: 8 }}>
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
                    style={{ width: '100%', padding: 8 }}
                  />
                </div>
              </label>
            </div>
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <label>
            Email <span style={{ color: 'red' }}>*</span>
            <input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              type="email"
              required
              style={{ width: '100%', padding: 8 }}
            />
          </label>
        </div>

        <div className="form-group">
          <PasswordInput
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            placeholder="Enter your password"
            label={
              <>
                Password <span style={{ color: 'red' }}>*</span>
              </>
            }
            className="form-control"
          />
        </div>

        <div className="form-group">
          <PasswordInput
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            placeholder="Confirm your password"
            label={
              <>
                Confirm Password <span style={{ color: 'red' }}>*</span>
              </>
            }
            className="form-control"
          />
        </div>

        {formData.role === 'student' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>
                First Name <span style={{ color: 'red' }}>*</span>
                <input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Last Name <span style={{ color: 'red' }}>*</span>
                <input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Date of Birth
                <input
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  type="date"
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Phone
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  type="tel"
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Department
                <input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Year
                <input
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  type="number"
                  min="1"
                  max="5"
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>
                Profile Photo
                <div style={{ marginTop: 8 }}>
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
                    style={{ width: '100%', padding: 8 }}
                  />
                </div>
              </label>
            </div>
          </>
        )}

        {error && (
          <div 
            className="alert alert-danger" 
            role="alert" 
            style={{ 
              marginTop: '1rem',
              padding: '12px 16px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              whiteSpace: 'pre-line', // Allow line breaks
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <strong>Registration Failed:</strong>
            <div style={{ marginTop: '8px' }}>{error}</div>
          </div>
        )}

        <button 
          disabled={loading} 
          type="submit" 
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: '1rem' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ marginRight: '8px' }}></span>
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        <p className="text-center mt-lg text-muted">
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Sign In</Link>
        </p>
      </form>
      </div>
    </div>
  );
}

