import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './firebase'; // يهيّئ Firebase عند إقلاع التطبيق
import './i18n'; // يهيّئ i18next ويضبط اتجاه الصفحة (RTL/LTR) حسب اللغة
import { queryClient } from './query/queryClient';
import { AuthGuardProvider } from './utils/authGuard';
import AppRouter from './router/AppRouter';
import './theme/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGuardProvider>
          <AppRouter />
        </AuthGuardProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
