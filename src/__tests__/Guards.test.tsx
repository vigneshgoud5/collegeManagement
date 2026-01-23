import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireRole } from '../routesGuards';

vi.mock('../store/auth', () => {
  let user: any = null;
  return {
    useAuthStore: () => ({ user, initialized: true }),
    __setUser: (u: any) => (user = u),
  } as any;
});

describe('Route guards', () => {
  it('redirects unauthenticated to login', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/secret' }]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route
            path="/secret"
            element={
              <RequireAuth>
                <div>SECRET</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });

  it('blocks wrong role', async () => {
    const store = await import('../store/auth');
    (store as any).__setUser({ id: '1', email: 'x', role: 'student' });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/acad' }]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route
            path="/acad"
            element={
              <RequireAuth>
                <RequireRole role="academic">
                  <div>ACAD</div>
                </RequireRole>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });
});


