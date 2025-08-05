import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TwoFA from './pages/TwoFA';
import Payments from './pages/Payments';
import DelegateEnergy from './pages/DelegateEnergy';
import Config from './pages/Config';
import CleanWallets from './pages/CleanWallets';
import ReportsPage from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import { setupInterceptors } from './api';

export default function App() {
  const auth = useAuth();

  // This effect connects the interceptors to the auth context
  useEffect(() => {
    const ejectInterceptors = setupInterceptors(auth);

    // Return the cleanup function to be run when the component unmounts or `auth` changes
    return ejectInterceptors;
  }, [auth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/2fa" element={<TwoFA />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/payments" replace />} />
          <Route path="payments" element={<Payments />} />
          <Route path="delegate-energy" element={<DelegateEnergy />} />
          <Route path="config" element={<Config />} />
          <Route path="clean-wallets" element={<CleanWallets />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>
      {/* A final catch-all to redirect any unknown paths */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
} 