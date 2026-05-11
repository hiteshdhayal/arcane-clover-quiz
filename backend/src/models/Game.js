import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: [{ type: String }],
  ans: { type: Number, required: true }, // index of correct option
  timeLimit: { type: Number, default: 10 }, // seconds
});

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1.0 },
  eliminated: { type: Boolean, default: false },
  answers: [{ question: Number, answer: Number, correct: Boolean, responseTime: Number }],
  prizesWon: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['general', 'pop', 'sports', 'finance', 'async'], default: 'general' },
    emoji: { type: String, default: '🧠' },
    prizePool: { type: Number, required: true },
    entryFee: { type: Number, default: 1.0 },
    scheduledAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },

    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended', 'cancelled'],
      default: 'upcoming',
    },

    questions: [questionSchema],
    currentQuestion: { type: Number, default: 0 },
    participants: [participantSchema],

    maxParticipants: { type: Number, default: 50000 },
    totalPlatformFee: { type: Number, default: 0 }, // 20% platform cut
    isAsync: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);
