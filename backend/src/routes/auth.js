import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { generateToken, protect } from '../middleware/auth.js';
import { ethers } from 'ethers';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    // Referral bonus
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.balance += 2.0;
        referrer.referrals += 1;
        await referrer.save();
        await Transaction.create({ userId: referrer._id, type: 'bonus', label: 'Referral Bonus', amount: 2.0 });
      }
    }

    // Sign-up credit
    await Transaction.create({ userId: user._id, type: 'bonus', label: 'Welcome Bonus', amount: 0.5 });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials or please login with Google' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance, stats: user.stats, league: user.league } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Google access token required' });

    let payload;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Invalid Google token');
      payload = await response.json();
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, name } = payload;
    if (!email) return res.status(400).json({ success: false, message: 'Google account has no email' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || 'User', email });
      // Sign-up credit
      await Transaction.create({ userId: user._id, type: 'bonus', label: 'Welcome Bonus', amount: 0.5 });
    }

    user.lastLogin = new Date();
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ success: true, token: jwtToken, user: { id: user._id, name: user.name, email: user.email, balance: user.balance, stats: user.stats, league: user.league } });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// POST /api/auth/wallet-connect
router.post('/wallet-connect', async (req, res) => {
  try {
    const { address, signature, message, network = 'ethereum' } = req.body;
    if (!address || !signature || !message)
      return res.status(400).json({ success: false, message: 'Address, signature and message required' });

    // Verify signature (EIP-191)
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase())
      return res.status(401).json({ success: false, message: 'Signature mismatch' });

    // Find or create user by wallet
    let user = await User.findOne({ [`walletAddresses.${network}`]: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: `User_${address.slice(2, 8)}`,
        email: `${address.toLowerCase()}@wallet.pulse`,
        walletAddresses: { [network]: address.toLowerCase() },
      });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, balance: user.balance, walletAddresses: user.walletAddresses } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/verify
router.get('/verify', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
