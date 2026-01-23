import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
// Import from root src since files were moved from client to root
import { Login } from '../../../src/pages/Login';

vi.mock('../../../src/store/auth', () => ({
  useAuthStore: () => ({ login: vi.fn() }),
}));

describe('Login page', () => {
  it('renders email, password and role dropdown', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    // Check for heading "Sign In"
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    // Check for form fields
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^role$/i)).toBeInTheDocument();
  });
});


