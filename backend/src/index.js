import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createClient } from 'redis';

import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import walletRoutes from './routes/wallet.js';
import paymentRoutes from './routes/payment.js';
import { registerGameHandlers } from './sockets/gameHandler.js';
import { registerPaymentHandlers } from './sockets/paymentHandler.js';

const app = express();
const httpServer = createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Redis ─────────────────────────────────────────────────────────────────────
export let redisClient = null;
(async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', (err) => console.warn('[Redis] Error:', err.message));
    await redisClient.connect();
    console.log('[Redis] Connected');
  } catch (err) {
    console.warn('[Redis] Not available – running without cache:', err.message);
  }
})();

// ── MongoDB ───────────────────────────────────────────────────────────────────
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse-trivia');
    console.log('[MongoDB] Connected');
  } catch (err) {
    console.warn('[MongoDB] Not available – running without DB:', err.message);
  }
})();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Socket.io handlers ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  registerGameHandlers(io, socket, redisClient);
  registerPaymentHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Pulse Server running on http://localhost:${PORT}`);
});

export { io };
