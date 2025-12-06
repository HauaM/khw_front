import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/common/Toast';
import AppRouter from '@/routes/AppRouter';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
