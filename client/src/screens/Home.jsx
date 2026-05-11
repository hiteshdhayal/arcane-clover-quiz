import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, shows, asyncChallenge } = useStore();
  const liveShow = shows.find(s => s.live);
  const upcoming = shows.filter(s => !s.live);
  
  const cats = ['All', 'General', 'Pop Culture', 'Sports', 'Finance'];
  const [activeCat, setActiveCat] = useState('All');

  return (
    <div className="screen active">
      <div className="glass-header-pill">
        <div className="header-logo" style={{ fontSize: 18 }}>
          <div style={{width: 24, height: 24, background: '#333', borderRadius: 6}}></div>
          <span>Pulse</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="balance-pill" onClick={() => navigate('/wallet')} style={{ padding: '4px 10px', fontSize: 13 }}>
            <span>\${user.balance.toFixed(2)}</span>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" stroke="var(--text-primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div className="notif-dot" style={{ position: 'absolute', top: -2, right: -2 }}></div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="dashboard-hero">
            <div className="badge badge-live" style={{ position: 'absolute', top: 16, left: 16 }}>LIVE NOW</div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--bg-primary)' }} className="mt-8">$250</div>
            <div style={{ fontSize: 22, fontWeight: 400, marginTop: 4, fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}>Pop Culture Blast</div>
            <button className="btn btn-primary btn-full mt-20" onClick={() => navigate('/live')} style={{ maxWidth: 260, margin: '0 auto' }}>
              ⚡ Join Live Show
            </button>
          </div>
        </div>

        <div className="section" style={{ paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {cats.map((c) => (
              <div 
                key={c} 
                className={`cat-pill ${activeCat === c ? 'active' : ''}`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-square-grid mt-8 mb-16">
          <div className="glass-square" onClick={() => navigate('/async')}>
            <div className="sq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
            <div className="sq-title">10-Question Quiz</div>
            <div className="sq-sub">Prize pool $150</div>
          </div>
          <div className="glass-square" onClick={() => navigate('/live')}>
            <div className="sq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
            <div className="sq-title">General Knowledge</div>
            <div className="sq-sub text-brown">$500 Prize</div>
          </div>
        </div>

        <div className="section">
          <div className="section-header"><div className="section-title">Your Stats</div></div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-val text-brown">\${user.totalWon.toFixed(2)}</div><div className="stat-label">Total Won</div></div>
            <div className="stat-card"><div className="stat-val text-charcoal">{user.streak} 🌿</div><div className="stat-label">Day Streak</div></div>
            <div className="stat-card"><div className="stat-val text-charcoal">{user.gamesPlayed}</div><div className="stat-label">Games Played</div></div>
            <div className="stat-card"><div className="stat-val text-green">{user.winRate}%</div><div className="stat-label">Win Rate</div></div>
          </div>
        </div>

        <div className="section">
          <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 600, fontSize: 18, fontFamily: 'var(--font-serif)' }}>League Rank: <span className="text-brown">#{user.league.rank}</span></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{user.league.points} points · Paid Tier</div>
            <button className="btn btn-outline btn-sm mt-12" style={{color: '#fff', borderColor: 'rgba(255,255,255,0.2)'}} onClick={() => navigate('/league')}>View Leaderboard →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
