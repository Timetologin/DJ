'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#22262e',
          color: '#e8eaed',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#e8eaed',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#e8eaed',
          },
        },
      }}
    />
  );
}
