import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  initials: String,
  score: { type: Number, default: 0 },
  totalWon: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  tier: { type: String, enum: ['Free', 'Paid', 'Elite'], default: 'Free' },
});

const leaderboardSchema = new mongoose.Schema(
  {
    period: { type: String, enum: ['daily', 'weekly', 'allTime'], default: 'weekly' },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    entries: [leaderboardEntrySchema],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Leaderboard', leaderboardSchema);
