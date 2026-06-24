import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layouts/AdminLayout';

// Public
import { LandingPage } from './app/public/LandingPage';

// Auth
import { Login } from './app/auth/Login';
import { Register } from './app/auth/Register';

// Admin pages
import { DashboardPage } from './app/admin/dashboard/DashboardPage';
import { SettingsPage } from './app/admin/SettingsPage';
import { UsersPage } from './app/admin/iam/UsersPage';
import { DriversPage } from './app/admin/iam/DriversPage';
import { AgentsPage } from './app/admin/iam/AgentsPage';
import { RidesPage } from './app/admin/rides/RidesPage';
import { LotadoresPage } from './app/admin/lotadores/LotadoresPage';
import { LocationPage } from './app/admin/location/LocationPage';
import { WalletPage } from './app/admin/wallet/WalletPage';
import { TicketsPage } from './app/admin/tickets/TicketsPage';

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin ─────────────────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="rides" element={<RidesPage />} />
            <Route path="lotadores" element={<LotadoresPage />} />
            <Route path="location" element={<LocationPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ── Root & Public ─────────────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#f8fafc',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
