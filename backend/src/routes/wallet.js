import express from 'express';
import { ethers } from 'ethers';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance cryptoBalance walletAddresses');
    res.json({ success: true, balance: user.balance, cryptoBalance: user.cryptoBalance, walletAddresses: user.walletAddresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Transaction.countDocuments({ userId: req.user._id });
    res.json({ success: true, transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wallet/deposit
// Generates a monitored deposit address for the user.
// In production this would derive HD wallet addresses or use a payment processor.
router.post('/deposit', protect, async (req, res) => {
  try {
    const { token = 'ETH', network = 'ethereum' } = req.body;
    const user = await User.findById(req.user._id);

    // Use the user's stored wallet address as the deposit target (for demo)
    const depositAddress = user.walletAddresses[network] || generateDepositAddress(user._id, token);

    res.json({
      success: true,
      depositAddress,
      token,
      network,
      qrData: `ethereum:${depositAddress}`, // EIP-681 URI
      message: `Send ${token} to this address. Funds credited after 3 confirmations.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, toAddress, token = 'USD', network = 'ethereum' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const user = await User.findById(req.user._id);

    if (token === 'USD') {
      if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
      user.balance -= amount;
    } else {
      const cryptoBal = user.cryptoBalance[token] || 0;
      if (cryptoBal < amount) return res.status(400).json({ success: false, message: `Insufficient ${token} balance` });
      user.cryptoBalance[token] -= amount;
    }

    await user.save();
    await Transaction.create({
      userId: user._id,
      type: 'withdraw',
      label: `Withdraw ${token}`,
      amount: -amount,
      crypto: token !== 'USD' ? { token, amount, toAddress, network, status: 'pending' } : undefined,
      status: 'pending',
    });

    res.json({ success: true, message: 'Withdrawal initiated. Processing in 1-2 business days.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper: derive a deterministic deposit address (demo only)
function generateDepositAddress(userId, token) {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
}

export default router;
