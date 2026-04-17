'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth-context';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1A1A1F',
            border: '1px solid #27272A',
            color: '#F5F5F5',
          },
        }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
