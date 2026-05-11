import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },

    // Crypto wallets
    walletAddresses: {
      ethereum: { type: String, default: null },
      solana: { type: String, default: null },
    },

    // Balances
    balance: { type: Number, default: 0.5, min: 0 }, // starts with $0.50 free credit
    cryptoBalance: {
      ETH: { type: Number, default: 0 },
      MATIC: { type: Number, default: 0 },
      USDC: { type: Number, default: 0 },
      SOL: { type: Number, default: 0 },
    },

    // Game stats
    stats: {
      totalWon: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      lastPlayed: { type: Date, default: null },
    },

    // League
    league: {
      rank: { type: Number, default: 9999 },
      tier: { type: String, enum: ['Free', 'Paid', 'Elite'], default: 'Free' },
      points: { type: Number, default: 0 },
    },

    // Power-ups
    powerups: {
      timeShield: { type: Number, default: 0 },
      doubleDown: { type: Number, default: 0 },
      questionPeek: { type: Number, default: 0 },
    },

    lives: { type: Number, default: 1 },
    referrals: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('User', userSchema);
