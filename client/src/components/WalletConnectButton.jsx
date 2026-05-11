import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Add some custom CSS just for the wallet button override
// Normally we could add this to index.css, but inline/style blocks also work for component scoped styles
const customWalletStyles = {
  background: 'linear-gradient(135deg, rgba(61, 61, 61, 0.95), rgba(30, 30, 30, 0.95))',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '99px',
  color: '#fff',
  fontFamily: "'Inter', sans-serif",
  fontWeight: '600',
  padding: '0 24px',
  height: '48px',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
};

export default function WalletConnectButton() {
  return (
    <div className="wallet-button-container" style={{ position: 'relative' }}>
      <style>
        {\`
          .wallet-button-container .wallet-adapter-button {
            background: linear-gradient(135deg, #9945FF 0%, #14F195 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 99px !important;
            font-family: var(--font-sans) !important;
            font-weight: 800 !important;
            color: #000 !important;
            height: 48px !important;
            padding: 0 24px !important;
            box-shadow: 0 8px 16px rgba(20, 241, 149, 0.2) !important;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            font-size: 14px !important;
          }
          .wallet-button-container .wallet-adapter-button:hover {
            transform: translateY(-2px) scale(1.02) !important;
            box-shadow: 0 12px 24px rgba(20, 241, 149, 0.4) !important;
            filter: brightness(1.1) !important;
          }
          .wallet-button-container .wallet-adapter-button-trigger {
            /* Styles for the un-connected state */
          }
          .wallet-adapter-dropdown-list {
            background: rgba(20, 20, 20, 0.9) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 20px !important;
            padding: 8px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
          }
          .wallet-adapter-dropdown-list-item {
            border-radius: 12px !important;
            color: #fff !important;
            font-weight: 600 !important;
          }
          .wallet-adapter-dropdown-list-item:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }
        \`}
      </style>
      <WalletMultiButton />
    </div>
  );
}
