import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import WalletConnectButton from '../components/WalletConnectButton';
import PaymentModal from '../components/PaymentModal';
import { useStore } from '../context/AppContext';
import memeImg from '../assets/meme.png';
import politicsImg from '../assets/politics.png';
import scandalsImg from '../assets/scandals.png';
import warsImg from '../assets/wars.png';

const games = [
  {
    title: 'Meme of the Week',
    img: memeImg,
    tag: 'TRENDING 🔥',
    prize: '$500',
    tagColor: '#FF6B6B',
  },
  {
    title: 'Politics or Comedy',
    img: politicsImg,
    tag: 'LIVE NOW 🎙️',
    prize: '$1,200',
    tagColor: '#A855F7',
  },
  {
    title: 'Scandals',
    img: scandalsImg,
    tag: 'HOT 💥',
    prize: '$800',
    tagColor: '#F59E0B',
  },
  {
    title: 'WARs',
    img: warsImg,
    tag: 'EPIC ⚔️',
    prize: '$2,000',
    tagColor: '#EF4444',
  },
];

const topWinners = [
  { rank: '🥇', name: 'Alex K.', amount: '$2,150', avatar: 'AK' },
  { rank: '🥈', name: 'Sam R.', amount: '$1,800', avatar: 'SR' },
  { rank: '🥉', name: 'Jordan T.', amount: '$1,200', avatar: 'JT' },
  { rank: '4', name: 'Priya M.', amount: '$900', avatar: 'PM' },
  { rank: '5', name: 'Noah W.', amount: '$650', avatar: 'NW' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleJoinQuiz = (quizInfo) => {
    if (!wallet.connected) {
      setVisible(true); // show wallet connect modal
      return;
    }
    setSelectedQuiz(quizInfo);
    setPaymentModalOpen(true);
  };

  const walletLinked = user?.walletAddresses?.solana;

  return (
    <div className="home-wrapper">
      {/* ── Ambient blobs ── */}
      <div className="home-blob home-blob-1" />
      <div className="home-blob home-blob-2" />
      <div className="home-blob home-blob-3" />

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="home-nav">
        {/* Brand */}
        <div className="home-nav-brand">
          <span className="home-nav-logo-icon">◎</span>
          <span className="home-nav-logo-text">ARCANE-QZ</span>
        </div>

        {/* Nav pills group */}
        <div className="home-nav-pills">
          {/* Name */}
          <div className="hn-pill hn-pill-name">
            <span className="hn-pill-avatar">
              {(user?.name || 'P')[0].toUpperCase()}
            </span>
            <span className="hn-pill-label">{user?.name || 'Player'}</span>
          </div>

          {/* Balance */}
          <div className="hn-pill">
            <span className="hn-pill-icon">💰</span>
            <div className="hn-pill-stack">
              <span className="hn-pill-caption">Balance</span>
              <span className="hn-pill-value">${user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Boosts */}
          <div className="hn-pill">
            <span className="hn-pill-icon">⚡</span>
            <div className="hn-pill-stack">
              <span className="hn-pill-caption">Boosts</span>
              <span className="hn-pill-value">3</span>
            </div>
          </div>

          {/* Solana Wallet Connect */}
          <WalletConnectButton />
        </div>
      </nav>

      {/* ══════════ HERO BAND ══════════ */}
      <div className="home-hero-band">
        <div className="hero-band-left">
          <div className="hero-live-badge">
            <span className="hero-live-dot" />
            LIVE NOW
          </div>
          <p className="hero-band-prize">$2,000</p>
          <p className="hero-band-label">WARs Grand Finale</p>
        </div>
        <button className="hero-join-btn" onClick={() => handleJoinQuiz({ title: 'WARs Grand Finale', prize: '$2,000', id: 'main' })}>
          ⚡ Join Live Show
        </button>
      </div>

      {/* ══════════ GAME CARDS ══════════ */}
      <div className="home-content">
        <h2 className="home-section-title">Browse All Quizzes</h2>

        <div className="home-cards-grid">
          {games.map((game, i) => (
            <div
              key={i}
              className={`hc-card ${hoveredCard === i ? 'hc-card-hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleJoinQuiz({ ...game, id: i })}
            >
              {/* Image fills card */}
              <div className="hc-img-wrap">
                <img src={game.img} alt={game.title} className="hc-img" />
                {/* Gradient overlay */}
                <div className="hc-img-overlay" />

                {/* Top tag */}
                <div
                  className="hc-tag"
                  style={{ background: game.tagColor }}
                >
                  {game.tag}
                </div>

                {/* Prize badge */}
                <div className="hc-prize-badge">{game.prize}</div>
              </div>

              {/* Bottom label */}
              <div className="hc-bottom">
                <span className="hc-title">{game.title}</span>
                <span className="hc-play-btn">▶</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ CURVED FOOTER ══════════ */}
      <footer className="home-footer">
        {/* Curved top */}
        <div className="footer-curve-top" />

        <div className="footer-inner">
          {/* Left — Past Winning */}
          <div className="footer-section">
            <p className="footer-section-label">🏆 Your Past Winnings</p>
            <p className="footer-big-val">${user?.stats?.totalWon?.toFixed(2) || '142.50'}</p>
            <div className="footer-stat-row">
              <div className="footer-mini-stat">
                <span className="fms-num">{user?.stats?.gamesPlayed || 38}</span>
                <span className="fms-label">Games</span>
              </div>
              <div className="footer-mini-stat">
                <span className="fms-num">{user?.stats?.winRate || '24'}%</span>
                <span className="fms-label">Win Rate</span>
              </div>
              <div className="footer-mini-stat">
                <span className="fms-num">{user?.stats?.streak || 7}🔥</span>
                <span className="fms-label">Streak</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider" />

          {/* Right — Top Winners */}
          <div className="footer-section">
            <p className="footer-section-label">🌟 Top Winners This Week</p>
            <div className="footer-winners-list">
              {topWinners.map((w, i) => (
                <div key={i} className="footer-winner-row">
                  <span className="fw-rank">{w.rank}</span>
                  <div className="fw-avatar">{w.avatar}</div>
                  <span className="fw-name">{w.name}</span>
                  <span className="fw-amount">{w.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="footer-bottom-bar">
          <span>© 2026 Arcane-QZ · Built on Solana</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onJoin={() => navigate('/live')}
        quizId={selectedQuiz?.id}
        prizePool={selectedQuiz?.prize}
      />
    </div>
  );
}
