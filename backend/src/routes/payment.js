import express from 'express';
import { ethers } from 'ethers';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Transaction from '../models/Transaction.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/auth.js';
import { verifyQuizPayment } from '../services/solanaService.js';

const router = express.Router();

// Token → USD exchange rates (in production, pull from CoinGecko API)
const RATES = { ETH: 3000, MATIC: 0.8, USDC: 1.0, SOL: 150 };
const REQUIRED_CONFIRMATIONS = { ethereum: 3, polygon: 20, solana: 32 };

// POST /api/payment/crypto  – verify an on-chain payment
router.post('/crypto', protect, async (req, res) => {
  try {
    const { txHash, token, network, expectedAmount } = req.body;
    if (!txHash || !token || !network)
      return res.status(400).json({ success: false, message: 'txHash, token and network required' });

    // Prevent duplicate processing
    const existing = await Transaction.findOne({ 'crypto.txHash': txHash });
    if (existing)
      return res.status(409).json({ success: false, message: 'Transaction already processed' });

    // In production: query Infura/Alchemy to get tx receipt + confirmations
    // For demo we simulate confirmation
    const cryptoAmount = expectedAmount || 0.01;
    const usdValue = cryptoAmount * (RATES[token] || 1);

    const user = await User.findById(req.user._id);
    user.balance += usdValue;
    user.cryptoBalance[token] = (user.cryptoBalance[token] || 0) + cryptoAmount;
    await user.save();

    const tx = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      label: `Crypto Deposit – ${cryptoAmount} ${token}`,
      amount: usdValue,
      crypto: { token, amount: cryptoAmount, txHash, network, confirmations: REQUIRED_CONFIRMATIONS[network], requiredConfirmations: REQUIRED_CONFIRMATIONS[network] },
      status: 'confirmed',
    });

    res.json({ success: true, transaction: tx, newBalance: user.balance, message: `Deposited ${cryptoAmount} ${token} (~$${usdValue.toFixed(2)})` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payment/entry-fee  – pay to join a game
router.post('/entry-fee', protect, async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    if (game.status === 'ended') return res.status(400).json({ success: false, message: 'Game has ended' });

    const user = await User.findById(req.user._id);
    if (user.balance < game.entryFee)
      return res.status(400).json({ success: false, message: 'Insufficient balance' });

    user.balance -= game.entryFee;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'entry',
      label: `Entry Fee – ${game.title}`,
      amount: -game.entryFee,
      gameId: game._id,
    });

    res.json({ success: true, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payment/prize-distribution
router.get('/prize-distribution', async (req, res) => {
  try {
    const { gameId } = req.query;
    const game = await Game.findById(gameId).select('prizePool participants title');
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    // Standard prize split
    const pool = game.prizePool;
    const distribution = {
      platformFee: +(pool * 0.20).toFixed(2),
      prizes: [
        { place: '1st', amount: +(pool * 0.40).toFixed(2), percent: '40%' },
        { place: '2nd', amount: +(pool * 0.20).toFixed(2), percent: '20%' },
        { place: '3rd', amount: +(pool * 0.10).toFixed(2), percent: '10%' },
        { place: 'Top 10%', amount: +(pool * 0.05).toFixed(2), percent: '5% each (split)' },
        { place: 'Survivors', amount: +(pool * 0.05).toFixed(2), percent: '5% split' },
      ],
    };
    res.json({ success: true, game: { title: game.title, prizePool: pool }, distribution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { txHash, quizId, walletAddress } = req.body;
    if (!txHash || !walletAddress) {
      return res.status(400).json({ success: false, message: 'txHash and walletAddress are required' });
    }

    // 1. Ensure tx not reused
    const existing = await Payment.findOne({ txHash });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Transaction already used.' });
    }

    // 2. Verify on blockchain
    const expectedAmount = 0.1; // Entry fee
    const verifyResult = await verifyQuizPayment(txHash, expectedAmount, walletAddress);

    if (!verifyResult.success) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    // 3. Mark payment successful & store in DB
    const newPayment = await Payment.create({
      userId: req.user._id,
      quizId: quizId || 'default-quiz',
      txHash,
      amount: expectedAmount,
      status: 'success'
    });

    // 4. Update user's solana wallet address if not set
    if (!req.user.walletAddress || !req.user.walletAddresses?.solana) {
        const user = await User.findById(req.user._id);
        user.walletAddress = walletAddress;
        user.walletAddresses.solana = walletAddress;
        await user.save();
    }

    res.json({ success: true, message: 'Payment verified and joined quiz', payment: newPayment });
  } catch (err) {
    console.error('Verify Payment Error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

export default router;
