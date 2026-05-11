import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/AppContext';
import { authService } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import bgImage from '../assets/sol_fishing_bg.png';

export default function Onboarding() {
  const navigate = useNavigate();
  const setUserFromAuth = useStore((s) => s.setUserFromAuth);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    if (token) {
      authService.verify()
        .then(({ data }) => {
          setUserFromAuth(data.user);
          navigate('/home');
        })
        .catch(() => localStorage.removeItem('pulse_token'));
    }
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await authService.googleLogin(tokenResponse.access_token);
        localStorage.setItem('pulse_token', data.token);
        setUserFromAuth(data.user);
        navigate('/home');
      } catch (error) {
        console.error('Google login failed', error);
      }
    },
    onError: () => console.log('Google login failed')
  });

  const handleAppleLogin  = () => console.log('Apple login clicked');

  return (
    /* ── Outer white border frame ── */
    <div className="ob-frame">

      {/* ── Inner scene (the actual image canvas) ── */}
      <div className="ob-scene" style={{ backgroundImage: `url(${bgImage})` }}>

        {/* ── Top-left overlay: headline ── */}
        <div className="ob-overlay-tl">
          {/* Logo / brand */}
          <div className="ob-brand">
            <span className="ob-brand-icon">◎</span>
            <span className="ob-brand-name">ARCANE -QZ</span>
          </div>

          {/* Big headline */}
          <h1 className="ob-headline">
            PLAY QUIZ<br />
            EARN <span className="ob-sol-highlight">SOL</span>
          </h1>

          {/* Glass Info Card */}
          <div className="ob-info-card">
            <div className="ob-info-item">
              <span className="ob-info-icon">✦</span>
              <span>Daily quiz at 8 PM</span>
            </div>
            <div className="ob-info-item">
              <span className="ob-info-icon">✦</span>
              <span>Up to 100x winning</span>
            </div>
            <div className="ob-info-item">
              <span className="ob-info-icon">✦</span>
              <span>Stake as much as you want</span>
            </div>
          </div>
        </div>

        {/* ── Top-right overlay: login buttons ── */}
        <div className="ob-overlay-tr">
          {/* Small cute login buttons */}
          <div className="ob-btn-row">
            <span className="ob-register-text">
              JOIN the FUN <span className="ob-register-arrow">&rarr;</span>
            </span>
            <button className="ob-mini-btn ob-mini-google" id="btn-google-login" onClick={handleGoogleLogin}>
              Google
            </button>
            <button className="ob-mini-btn ob-mini-apple" id="btn-apple-login" onClick={handleAppleLogin}>
              Apple
            </button>
          </div>

          <p className="ob-mini-terms">
            By joining you agree to our <a href="#">Terms</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
