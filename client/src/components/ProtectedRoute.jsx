import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/AppContext';
import { authService } from '../services/api';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, setUserFromAuth } = useStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) { setChecking(false); return; }
    const token = localStorage.getItem('pulse_token');
    if (!token) { setChecking(false); return; }

    authService.verify()
      .then(({ data }) => {
        setUserFromAuth(data.user);
      })
      .catch(() => {
        localStorage.removeItem('pulse_token');
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--accent-charcoal)', opacity: 0.5 }}>Loading…</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
