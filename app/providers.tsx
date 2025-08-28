"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Disabled React Query DevTools to fix popup error */}
      {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}
