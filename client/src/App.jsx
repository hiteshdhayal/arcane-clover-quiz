import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import LiveShow from './screens/LiveShow';
import League from './screens/League';
import Wallet from './screens/Wallet';
import Store from './screens/Store';
import Profile from './screens/Profile';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout() {
  const location = useLocation();
  const showNav = location.pathname !== '/' && location.pathname !== '/live';

  return (
    <div id="app-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/"        element={<Onboarding />} />
        <Route path="/home"    element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/live"    element={<ProtectedRoute><LiveShow /></ProtectedRoute>} />
        <Route path="/league"  element={<ProtectedRoute><League /></ProtectedRoute>} />
        <Route path="/wallet"  element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/store"   element={<ProtectedRoute><Store /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
