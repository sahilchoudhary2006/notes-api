import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--gray-800)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
