import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Timer, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  Wallet, 
  Activity,
  Award,
  Crown
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletConnectButton from '../components/WalletConnectButton';

import pepeImg from '../assets/memes/pepe.png';
import wojakImg from '../assets/memes/wojak.png';
import dogeImg from '../assets/memes/doge.png';
import chadImg from '../assets/memes/chad.png';
import distractedBfImg from '../assets/memes/distracted_bf.png';

const DUMMY_QUESTIONS = [
  {
    id: 1,
    question: "What emotion best describes this meme?",
    image: pepeImg,
    options: ["Financial Confidence", "Existential Panic", "Post-pump Regret", "Diamond Hands"],
    correct: 3, // Diamond Hands
  },
  {
    id: 2,
    question: "What usually happens after this face appears on Crypto Twitter?",
    image: wojakImg,
    options: ["Massive rally", "Market dump", "NFT mint", "Exchange listing"],
    correct: 1, // Market dump
  },
  {
    id: 3,
    question: "What is the classic Doge caption style?",
    image: dogeImg,
    options: ["Formal grammar", "Shakespearean English", "Broken adjective phrases", "Technical jargon"],
    correct: 2, // Broken adjective phrases
  },
  {
    id: 4,
    question: "What archetype does the Chad represent?",
    image: chadImg,
    options: ["Overthinking trader", "Fearless winner", "Rugpull victim", "Bot account"],
    correct: 1, // Fearless winner
  },
  {
    id: 5,
    question: "What does this meme format usually represent?",
    image: distractedBfImg,
    options: ["Portfolio balancing", "Attention switching", "Blockchain scaling", "Crypto mining"],
    correct: 1, // Attention switching
  }
];

const LEADERBOARD = [
  { name: 'SolanaWhale', score: 2500, avatar: '🐋' },
  { name: 'DogeKing', score: 2100, avatar: '🐕' },
  { name: 'PaperHands_99', score: 1850, avatar: '📄' },
  { name: 'CryptoChad', score: 1600, avatar: '💪' },
  { name: 'Wojak_Buyer', score: 1400, avatar: '😭' },
];

const CHAT_MESSAGES = [
  { user: 'Anon123', msg: 'LFG! 🚀', color: 'text-blue-400' },
  { user: 'MoonBoy', msg: 'PEPE TO THE MOON', color: 'text-green-400' },
  { user: 'RuggingNow', msg: 'Easy question lol', color: 'text-purple-400' },
  { user: 'DiamondGrip', msg: 'HODL GUYS', color: 'text-yellow-400' },
];

export default function LiveShow() {
  const { connected, publicKey } = useWallet();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct' or 'wrong'
  const [gameEnded, setGameEnded] = useState(false);
  
  const timerRef = useRef(null);

  const currentQuestion = DUMMY_QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !gameEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(-1); // Timeout
    }

    return () => clearInterval(timerRef.current);
  }, [timeLeft, isAnswered, gameEnded]);

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedOption(optionIndex);
    clearInterval(timerRef.current);

    const isCorrect = optionIndex === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 100);
      setShowFeedback('correct');
    } else {
      setShowFeedback('wrong');
    }

    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < DUMMY_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(15);
        setShowFeedback(null);
      } else {
        setGameEnded(true);
      }
    }, 2000);
  };

  const renderBackground = () => (
    <div className="arena-bg">
      <div className="arena-grid" />
      <div className="arena-blob bg-blue-500 w-[600px] h-[600px] -top-48 -left-48" />
      <div className="arena-blob bg-purple-600 w-[500px] h-[500px] -bottom-48 -right-48" />
      <div className="arena-blob bg-cyan-400 w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
    </div>
  );

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 md:px-8 flex items-center justify-between bg-dark-navy/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-white">
          <span className="text-neon-blue">MEME</span> OF THE WEEK
        </h1>
        <div className="hidden md:flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
          <div className="w-2 h-2 bg-red-500 rounded-full pulse-red" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-white/50 uppercase tracking-widest">Prize Pool</span>
          <span className="text-xl font-black text-neon-blue">$5,000.00</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Users size={16} className="text-neon-blue" />
          <span className="text-sm font-bold text-white">12,482 Players</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-center justify-center bg-neon-blue/10 w-12 h-12 rounded-xl border border-neon-blue/30">
              <span className="text-[10px] text-neon-blue font-bold">RND</span>
              <span className="text-lg font-black text-white leading-none">{currentQuestionIndex + 1}</span>
           </div>
           <div className="flex flex-col items-center justify-center bg-white/5 w-12 h-12 rounded-xl border border-white/10">
              <Timer size={16} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white/50'} />
              <span className={`text-lg font-black leading-none ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span>
           </div>
        </div>
      </div>
    </header>
  );

  const renderSidePanel = () => (
    <aside className="hidden xl:flex flex-col gap-6 w-80 fixed right-8 top-28 bottom-28 z-40">
      {/* Leaderboard */}
      <div className="glass-card-premium rounded-3xl p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            <h3 className="font-bold text-white">Leaderboard</h3>
          </div>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Top 5</span>
        </div>
        <div className="space-y-4 overflow-y-auto">
          {LEADERBOARD.map((user, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest">{user.score} XP</p>
              </div>
              <div className="text-xs font-black text-neon-blue">#{i+1}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Chat */}
      <div className="glass-card-premium rounded-3xl p-6 h-64 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-neon-blue" />
          <h3 className="font-bold text-white">Live Arena Chat</h3>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {CHAT_MESSAGES.map((msg, i) => (
            <div key={i} className="text-xs">
              <span className={`font-bold ${msg.color}`}>{msg.user}: </span>
              <span className="text-white/80">{msg.msg}</span>
            </div>
          ))}
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type message..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-blue hover:scale-110 transition-transform">
            <Zap size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </aside>
  );

  const renderBottomBar = () => (
    <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-dark-navy/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Mainnet-Beta</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/40 text-[10px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1">
            <span className="text-neon-blue">Entry Fee:</span>
            <span className="text-white">0.05 SOL</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-neon-blue">Distributed:</span>
            <span className="text-white">12,450.25 SOL</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Wallet Connected</span>
           <span className="text-xs text-white font-mono">{publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Not Connected'}</span>
        </div>
        <WalletConnectButton />
      </div>
    </footer>
  );

  if (gameEnded) {
    return (
      <div className="min-h-screen text-white font-sans flex items-center justify-center p-6">
        {renderBackground()}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-premium rounded-[40px] p-12 max-w-lg w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-neon-blue" />
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-neon-blue/20 rounded-full flex items-center justify-center border border-neon-blue/30 relative">
              <Crown size={48} className="text-neon-blue" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-neon-blue/10 rounded-full blur-xl"
              />
            </div>
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter">FINISH LINE</h2>
          <p className="text-white/50 mb-8 uppercase tracking-widest text-sm font-bold">You survived the meme arena</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Final Score</span>
              <span className="text-3xl font-black text-neon-blue">{score}</span>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Rank</span>
              <span className="text-3xl font-black text-white">#42</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/home'}
            className="w-full bg-neon-blue text-dark-navy py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform hover:shadow-neon"
          >
            Claim Rewards & Exit
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden">
      {renderBackground()}
      {renderHeader()}
      {renderSidePanel()}
      {renderBottomBar()}

      <main className="pt-28 pb-32 px-6 flex flex-col items-center justify-center min-h-screen xl:pr-96">
        {/* Animated HUD Elements */}
        <div className="absolute top-40 left-12 hidden 2xl:block opacity-20">
          <Activity size={100} className="text-neon-blue animate-pulse" />
        </div>
        <div className="absolute bottom-40 left-20 hidden 2xl:block opacity-20">
          <TrendingUp size={100} className="text-purple-500 animate-bounce" />
        </div>

        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-12 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / DUMMY_QUESTIONS.length) * 100}%` }}
              className="h-full bg-neon-blue shadow-neon"
            />
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-12 py-6 rounded-3xl border-2 backdrop-blur-2xl font-black text-3xl tracking-tighter ${
                  showFeedback === 'correct' ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.3)]'
                }`}
              >
                {showFeedback === 'correct' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Award size={48} />
                    <span>CORRECT +100 XP</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Zap size={48} />
                    <span>WRONG ANSWER</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -50, rotate: -2 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`glass-card-premium rounded-[40px] p-8 md:p-12 relative ${isAnswered && showFeedback === 'wrong' ? 'shake' : ''}`}
            >
              {/* Neon border glow */}
              <div className="absolute inset-0 rounded-[40px] border border-neon-blue/30 pointer-events-none" />
              
              {/* Meme Container */}
              <div className="relative aspect-video mb-10 rounded-3xl overflow-hidden border-2 border-white/10 group">
                <img 
                  src={currentQuestion.image} 
                  alt="Meme" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-navy to-transparent opacity-60" />
                
                {/* HUD Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                   <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-[8px] font-black uppercase tracking-widest">
                     Scan Active
                   </div>
                </div>
                <div className="absolute bottom-4 left-4">
                   <span className="text-neon-blue font-mono text-[10px]">ID: MEME-SQ-{currentQuestion.id}</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black mb-10 tracking-tight leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswered && idx === currentQuestion.correct;
                  const isWrong = isAnswered && isSelected && idx !== currentQuestion.correct;

                  return (
                    <motion.button
                      whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={isAnswered}
                      className={`relative group overflow-hidden p-6 rounded-2xl text-left font-bold transition-all duration-300 border-2 ${
                        isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' :
                        isWrong ? 'bg-red-500/20 border-red-500 text-red-400' :
                        isSelected ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' :
                        'bg-white/5 border-white/10 text-white/80 hover:border-neon-blue/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${
                          isCorrect ? 'border-green-500/50 bg-green-500/20' :
                          isWrong ? 'border-red-500/50 bg-red-500/20' :
                          isSelected ? 'border-neon-blue/50 bg-neon-blue/20' :
                          'border-white/20 bg-white/10'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </div>
                      
                      {/* Hover Glow */}
                      {!isAnswered && (
                        <div className="absolute inset-0 bg-neon-blue/0 group-hover:bg-neon-blue/5 transition-colors" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Emojis / Activity Ticker */}
        <div className="mt-12 w-full max-w-2xl overflow-hidden relative h-10">
           <motion.div 
             animate={{ x: [-1000, 1000] }}
             transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
             className="flex gap-12 whitespace-nowrap text-xs font-black uppercase tracking-[0.3em] text-white/20"
           >
              <span>User @SolanaGuy joined</span>
              <span>•</span>
              <span>New Bid: 2.5 SOL</span>
              <span>•</span>
              <span>@MoonBoy reacted 🚀</span>
              <span>•</span>
              <span>Total Prize: $5,240</span>
              <span>•</span>
              <span>Streak: 7 Correct</span>
           </motion.div>
        </div>
      </main>
    </div>
  );
}
