import React from 'react';
import { useStore } from '../context/AppContext';

export default function Wallet() {
  const user = useStore(state => state.user);
  
  return (
    <div className="screen active">
      <div className="content" style={{ padding: 24 }}>
        <h1 className="text-charcoal mb-24">Wallet</h1>
        <div className="dashboard-hero">
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Total Balance</div>
          <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--bg-primary)' }}>\${user.balance.toFixed(2)}</div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
          <button className="btn btn-primary btn-full">Deposit Crypto</button>
          <button className="btn btn-secondary btn-full">Withdraw</button>
        </div>
      </div>
    </div>
  );
}
