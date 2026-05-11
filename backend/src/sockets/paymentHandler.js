import { ethers } from 'ethers';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// Token rates: token → USD (in production fetch from CoinGecko)
const RATES = { ETH: 3000, MATIC: 0.8, USDC: 1.0, SOL: 150 };

export function registerPaymentHandlers(io, socket) {

  // ── wallet:deposit ─────────────────────────────────────────────────────────
  // Client requests a deposit address for a specific token/network
  socket.on('wallet:deposit', async ({ userId, token = 'ETH', network = 'ethereum' }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return socket.emit('error', { message: 'User not found' });

      // In production: derive HD wallet address per user+token
      const depositAddress = user.walletAddresses[network] || ethers.Wallet.createRandom().address;
      const qrData = `${network === 'solana' ? 'solana' : 'ethereum'}:${depositAddress}`;

      socket.emit('wallet:deposit_address', {
        depositAddress,
        token,
        network,
        qrData,
        message: `Send ${token} to this address. Credited after ${network === 'solana' ? 32 : 3} confirmations.`,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── payment:verify ─────────────────────────────────────────────────────────
  // Client submits a txHash for verification after sending crypto
  socket.on('payment:verify', async ({ txHash, token, network, userId, expectedAmount }) => {
    try {
      if (!txHash || !token || !network || !userId)
        return socket.emit('payment:failed', { message: 'Missing payment details' });

      // Check for duplicate
      const existing = await Transaction.findOne({ 'crypto.txHash': txHash });
      if (existing)
        return socket.emit('payment:failed', { message: 'Transaction already processed' });

      // ── In production: verify on-chain via Infura/Alchemy ─────────────────
      // const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
      // const receipt = await provider.getTransactionReceipt(txHash);
      // if (!receipt || receipt.confirmations < 3) { ... }
      // For demo: trust the client-submitted amount
      // ──────────────────────────────────────────────────────────────────────

      const cryptoAmount = expectedAmount || 0.01;
      const usdValue = +(cryptoAmount * (RATES[token] || 1)).toFixed(2);

      const user = await User.findById(userId);
      if (!user) return socket.emit('payment:failed', { message: 'User not found' });

      user.balance += usdValue;
      user.cryptoBalance[token] = (user.cryptoBalance[token] || 0) + cryptoAmount;
      await user.save();

      const tx = await Transaction.create({
        userId: user._id,
        type: 'deposit',
        label: `Crypto Deposit – ${cryptoAmount} ${token}`,
        amount: usdValue,
        status: 'confirmed',
        crypto: {
          token,
          amount: cryptoAmount,
          txHash,
          network,
          confirmations: network === 'solana' ? 32 : 3,
          requiredConfirmations: network === 'solana' ? 32 : 3,
        },
      });

      socket.emit('payment:confirmed', {
        txHash,
        token,
        cryptoAmount,
        usdValue,
        newBalance: user.balance,
        transaction: tx,
      });

      // Also emit a balance update to any other tab/device this user has open
      io.to(`user:${userId}`).emit('user:balance_update', { balance: user.balance });

      console.log(`[Payment] ${cryptoAmount} ${token} credited to user ${userId} ($${usdValue})`);
    } catch (err) {
      socket.emit('payment:failed', { message: err.message });
    }
  });
}
