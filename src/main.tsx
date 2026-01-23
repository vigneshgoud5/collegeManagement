import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import './styles/college-portal.css';

const root = document.getElementById('root')!;
const queryClient = new QueryClient();

function AppInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppInit />
    </QueryClientProvider>
  </React.StrictMode>
);


