import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'entry', 'win', 'bonus', 'topup', 'item', 'refund'],
      required: true,
    },
    label: { type: String, required: true },

    // Fiat
    amount: { type: Number, default: 0 }, // in USD

    // Crypto
    crypto: {
      token: { type: String, enum: ['ETH', 'MATIC', 'USDC', 'SOL', null], default: null },
      amount: { type: Number, default: 0 },
      txHash: { type: String, default: null },
      blockNumber: { type: Number, default: null },
      network: { type: String, enum: ['ethereum', 'polygon', 'solana', null], default: null },
      fromAddress: { type: String, default: null },
      toAddress: { type: String, default: null },
      confirmations: { type: Number, default: 0 },
      requiredConfirmations: { type: Number, default: 3 },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'cancelled'],
      default: 'confirmed',
    },

    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ 'crypto.txHash': 1 }, { sparse: true });

export default mongoose.model('Transaction', transactionSchema);
