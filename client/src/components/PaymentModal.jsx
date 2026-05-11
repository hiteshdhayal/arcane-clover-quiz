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
      const token = localStorage.getItem('pulse_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const verifyRes = await fetch(\`\${apiUrl}/api/payment/verify\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
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
        }, 2000);
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

  return (
    <div className="modal-overlay" style={{ 
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease-in-out'
    }}>
      <div className="modal" style={{ 
        background: 'rgba(20, 20, 20, 0.8)',
        color: '#fff',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        padding: '40px',
        maxWidth: '440px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <style>
          {\`
            @keyframes modalFadeIn {
              from { opacity: 0; transform: scale(0.95) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .premium-gradient-text {
              background: linear-gradient(135deg, #fff 0%, #aaa 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          \`}
        </style>

        <div className="modal-handle" style={{ background: 'rgba(255, 255, 255, 0.1)', width: '40px', height: '4px', borderRadius: '2px', margin: '0 auto 24px' }} />
        
        <h2 className="modal-title premium-gradient-text" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>Confirm Entry</h2>
        <p className="modal-sub" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px', marginBottom: '32px', textAlign: 'center' }}>Pay entry fee to join the competition</p>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '24px', 
          padding: '24px', 
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: '500' }}>Network</span>
            <span style={{ fontWeight: '600', color: '#14F195', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#14F195', borderRadius: '50%', boxShadow: '0 0 10px #14F195' }}></span>
              {import.meta.env.VITE_SOLANA_NETWORK || 'Devnet'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: '500' }}>Your Balance</span>
            <span style={{ fontWeight: '600' }}>{balance !== null ? \`\${balance.toFixed(4)} SOL\` : '---'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: '500' }}>Prize Pool</span>
            <span style={{ fontWeight: '700', color: '#fff' }}>{prizePool}</span>
          </div>
          
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '20px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px', fontWeight: '600' }}>Entry Fee</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '800', fontSize: '24px', color: '#fff' }}>{ENTRY_FEE} SOL</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>+ ~0.000005 network fee</div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#EF4444', 
            padding: '16px', 
            borderRadius: '16px', 
            fontSize: '14px', 
            marginBottom: '24px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          {status === 'paying' && (
            <div style={{ textAlign: 'center', color: '#3B82F6', fontWeight: '600', animation: 'pulse 2s infinite' }}>
              Waiting for wallet signature...
            </div>
          )}
          {status === 'confirming' && (
            <div style={{ textAlign: 'center', color: '#F59E0B', fontWeight: '600', animation: 'pulse 2s infinite' }}>
              Blockchain confirmation in progress...
            </div>
          )}
          {status === 'success' && (
            <div style={{ textAlign: 'center', color: '#10B981', fontWeight: '700', fontSize: '18px' }}>
              🚀 Payment Successful! Joining...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} 
            onClick={onClose}
            disabled={loading || status === 'success'}
          >
            Cancel
          </button>
          <button 
            className="btn" 
            style={{ 
              flex: 2, 
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)', 
              color: '#000', 
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px -5px rgba(20, 241, 149, 0.3)',
              transition: 'all 0.2s'
            }} 
            onClick={handlePayAndJoin}
            disabled={loading || status === 'success'}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner"></span> Processing...
              </span>
            ) : 'Pay & Join Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
