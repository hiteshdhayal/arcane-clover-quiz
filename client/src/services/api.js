import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
  walletConnect: (data) => API.post('/api/auth/wallet-connect', data),
  verify: () => API.get('/api/auth/verify'),
  googleLogin: (token) => API.post('/api/auth/google', { token }),
};

export const gameService = {
  upcoming: () => API.get('/api/games/upcoming'),
  live: () => API.get('/api/games/live'),
  join: (gameId) => API.post('/api/games/join', { gameId }),
  history: () => API.get('/api/games/history'),
};

export const walletService = {
  balance: () => API.get('/api/wallet/balance'),
  transactions: (page = 1) => API.get(`/api/wallet/transactions?page=${page}`),
  deposit: (token, network) => API.post('/api/wallet/deposit', { token, network }),
  withdraw: (data) => API.post('/api/wallet/withdraw', data),
};

export const paymentService = {
  verifyCrypto: (data) => API.post('/api/payment/crypto', data),
  payEntryFee: (gameId) => API.post('/api/payment/entry-fee', { gameId }),
  prizeDistribution: (gameId) => API.get(`/api/payment/prize-distribution?gameId=${gameId}`),
};

export default API;
