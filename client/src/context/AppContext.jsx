import { create } from 'zustand';

export const useStore = create((set) => ({
  user: {
    name: 'Alex Rivera',
    initials: 'AR',
    balance: 4.20,
    streak: 7,
    totalWon: 142.50,
    gamesPlayed: 38,
    winRate: 24,
    league: { rank: 47, tier: 'Paid', points: 1840 },
    referrals: 3,
    powerups: { timeShield: 2, doubleDown: 1, questionPeek: 0 },
    lives: 1,
  },
  setUserBalance: (amount) => set((state) => ({ user: { ...state.user, balance: state.user.balance + amount } })),
  setUserFromAuth: (apiUser) => set((state) => ({
    user: {
      ...state.user,
      name: apiUser.name || state.user.name,
      email: apiUser.email || '',
      balance: typeof apiUser.balance === 'number' ? apiUser.balance : state.user.balance,
      initials: (apiUser.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      league: apiUser.league || state.user.league,
      stats: apiUser.stats || {},
    },
    isAuthenticated: true,
  })),
  isAuthenticated: false,
  logout: () => {
    localStorage.removeItem('pulse_token');
    set({ isAuthenticated: false });
  },
  
  shows: [
    {
      id: 1, title: 'General Knowledge', emoji: '🧠', prize: '$500',
      time: '8:00 PM', countdown: 3600, players: 8247, entry: 1.00,
      category: 'general', live: false, hot: true,
    },
    {
      id: 2, title: 'Pop Culture Blast', emoji: '🎬', prize: '$250',
      time: '6:00 PM', countdown: 800, players: 4103, entry: 0.50,
      category: 'pop', live: true, hot: false,
    },
    {
      id: 3, title: 'Sports Trivia Pro', emoji: '🏆', prize: '$750',
      time: '9:30 PM', countdown: 9000, players: 12401, entry: 1.00,
      category: 'sports', live: false, hot: true,
    },
  ],
  
  asyncChallenge: {
    available: true,
    timeLeft: 14 * 3600 + 22 * 60, // 14h22m in seconds
    question: 0,
    answers: [],
    complete: false,
    score: 0,
  },
  
  leaderboard: [
    { rank:1, name:'KingTrivia',  initials:'KT', score:'$142.80', badge:'👑' },
    { rank:2, name:'QuizMaster',  initials:'QM', score:'$138.20', badge:'🥈' },
    { rank:3, name:'FastFingers', initials:'FF', score:'$121.50', badge:'🥉' },
    { rank:4, name:'BrainBlast',  initials:'BB', score:'$98.40',  badge:'' },
    { rank:5, name:'SmartMove',   initials:'SM', score:'$87.10',  badge:'' },
    { rank:6, name:'TriviaPro',   initials:'TP', score:'$76.80',  badge:'' },
    { rank:47, name:'You (Alex)', initials:'AR', score:'$47.20',  badge:'⚡', isMe:true },
  ],
  
  transactions: [
    { id:1, label:'Won: Pop Culture Show', amount:'+$12.50', date:'Today 6:14PM', type:'win' },
    { id:2, label:'Show Entry', amount:'-$1.00', date:'Today 6:00PM', type:'entry' },
    { id:3, label:'Withdrew to Debit', amount:'-$20.00', date:'Yesterday', type:'withdraw' },
    { id:4, label:'Won: General Knowledge', amount:'+$8.40', date:'May 10', type:'win' },
    { id:5, label:'Show Entry', amount:'-$1.00', date:'May 10', type:'entry' },
    { id:6, label:'Extra Life', amount:'-$0.10', date:'May 10', type:'item' },
    { id:7, label:'Referral Bonus', amount:'+$2.00', date:'May 9', type:'bonus' },
    { id:8, label:'Top Up', amount:'+$10.00', date:'May 9', type:'topup' },
  ],
  
  liveShow: {
    active: false,
    question: 0,
    totalQuestions: 12,
    timeLeft: 10,
    players: 8247,
    prizePool: 500,
    streak: 0,
    eliminated: false,
    answers: [],
    score: 0,
    multiplier: 1.0,
  },
}));
