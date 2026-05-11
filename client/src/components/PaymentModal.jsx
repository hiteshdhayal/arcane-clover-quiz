import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { sendEntryPayment } from '../utils/sendEntryPayment';

export default function PaymentModal({ isOpen, onClose, onJoin, quizId, prizePool }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, paying, confirming, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const ENTRY_FEE = 0.1; // SOL

  useEffect(() => {
    if (publicKey && isOpen) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection, isOpen]);

  if (!isOpen) return null;

  const handlePayAndJoin = async () => {
    try {
      if (!publicKey) {
        setErrorMsg('Please connect your wallet first.');
        return;
      }
      if (balance !== null && balance < ENTRY_FEE) {
        setErrorMsg('Insufficient funds for entry fee.');
        return;
      }

      setLoading(true);
      setErrorMsg('');
      setStatus('paying');

      // 1. Send transaction
      const txHash = await sendEntryPayment(wallet, ENTRY_FEE, import.meta.env.VITE_SOLANA_NETWORK || 'devnet');
      
      setStatus('confirming');

      // 2. Send to backend to verify
      const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          quizId,
          walletAddress: publicKey.toString()
        })
      });
      const data = await verifyRes.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          onJoin();
          onClose();
          setStatus('idle');
          setLoading(false);
        }, 1500);
      } else {
        throw new Error(data.message || 'Payment verification failed on backend.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Transaction failed. Please try again.');
      setLoading(false);
    }
  };

  const isDark = true;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal" style={{ background: isDark ? 'rgba(30, 30, 30, 0.95)' : '#fff', color: isDark ? '#fff' : '#000', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="modal-handle" style={{ background: isDark ? 'rgba(255,255,255,0.2)' : '#ccc' }} />
        <h2 className="modal-title" style={{ color: isDark ? '#fff' : '#000' }}>Join Quiz</h2>
        <p className="modal-sub" style={{ color: isDark ? '#aaa' : '#666' }}>Secure entry fee payment</p>

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Network</span>
            <span style={{ fontWeight: '600' }}>{import.meta.env.VITE_SOLANA_NETWORK || 'Devnet'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Wallet Balance</span>
            <span style={{ fontWeight: '600' }}>{balance !== null ? \`\${balance.toFixed(4)} SOL\` : 'Loading...'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Prize Pool</span>
            <span style={{ fontWeight: '600', color: '#4ADE80' }}>{prizePool}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Entry Fee</span>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>{ENTRY_FEE} SOL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa', fontSize: '12px' }}>Estimated Fees</span>
            <span style={{ color: '#aaa', fontSize: '12px' }}>~0.000005 SOL</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {status === 'paying' && <p style={{ textAlign: 'center', marginBottom: '16px', color: '#3B82F6' }}>Approve transaction in wallet...</p>}
        {status === 'confirming' && <p style={{ textAlign: 'center', marginBottom: '16px', color: '#F59E0B' }}>Waiting for blockchain confirmation...</p>}
        {status === 'success' && <p style={{ textAlign: 'center', marginBottom: '16px', color: '#10B981', fontWeight: 'bold' }}>✅ Payment successful!</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1, border: 'none' }} 
            onClick={onClose}
            disabled={loading || status === 'success'}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 2, background: 'linear-gradient(135deg, #1E3A5F, #2563EB)', border: 'none', color: '#fff' }} 
            onClick={handlePayAndJoin}
            disabled={loading || status === 'success'}
          >
            {loading ? 'Processing...' : 'Pay & Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
