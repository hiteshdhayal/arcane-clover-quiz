import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, CalendarCheck, Wallet, Store, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} strokeWidth={1.5} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/league" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Trophy size={22} strokeWidth={1.5} />
        <span>League</span>
      </NavLink>
      <NavLink to="/async" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 4, right: 22, width: 8, height: 8, background: 'var(--accent-green)', borderRadius: '50%' }}></div>
        <CalendarCheck size={22} strokeWidth={1.5} />
        <span>Daily</span>
      </NavLink>
      <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Wallet size={22} strokeWidth={1.5} />
        <span>Wallet</span>
      </NavLink>
      <NavLink to="/store" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={22} strokeWidth={1.5} />
        <span>Store</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} strokeWidth={1.5} />
        <span>Me</span>
      </NavLink>
    </nav>
  );
}
