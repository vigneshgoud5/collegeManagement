import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { PortalBanner } from './PortalBanner';
import { useState, useEffect, useRef } from 'react';

export function StudentNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleChangePassword = () => {
    setMobileMenuOpen(false);
    navigate('/student/settings');
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard/student', label: 'Dashboard' },
    { path: '/student/profile', label: 'My Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <PortalBanner />
      <nav className="navbar" ref={navRef}>
        <div className="navbar-content">
          <div>
          <Link to="/dashboard/student" className="navbar-brand" onClick={handleNavClick}>
            Dashboard
          </Link>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          <ul className={`navbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleChangePassword}
                className={`nav-link nav-button ${isActive('/student/settings') ? 'active' : ''}`}
              >
                🔒 Change Password
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="nav-link nav-button nav-button-danger"
              >
                🚪 Logout
              </button>
            </li>
          </ul>
          {user && (
            <div className="navbar-user-info">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.email}
                  className="avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="navbar-user-name">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
