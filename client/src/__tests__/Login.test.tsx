import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { Login } from '../pages/Login';

vi.mock('../store/auth', () => ({
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


