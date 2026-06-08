import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/router';
import { queryClient } from '@/lib/queryClient';
import { initializeAuth } from '@/lib/initAuth';

/** Runs the silent-login attempt once on mount. */
function AuthBootstrapper() {
  useEffect(() => {
    void initializeAuth();
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapper />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
