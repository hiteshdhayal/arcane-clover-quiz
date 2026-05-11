# ARCANE -QZ 🍀

**Arcane Clover Quiz** is a high-stakes, real-time trivia platform built for the Solana ecosystem. Compete in daily quizzes, climb the leagues, and earn SOL through competitive knowledge.

![Onboarding Screenshot](client/src/assets/sol_fishing_bg.png)

## ✨ Features=>

- **Real-Time Trivia**: Live multiplayer quiz sessions synchronized via WebSockets.
- **Earn SOL**: Integrated crypto payment flows for entry fees and prize distributions.
- **Premium UI**: Zen-inspired glassmorphism design with smooth Framer Motion animations.
- **Secure Auth**: Google OIDC integration for seamless onboarding.
- **League System**: Competitive tiers including Free, Paid, and Elite leagues.
- **Referral Program**: Earn bonuses by inviting friends to join the fun.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Real-time**: [Socket.io](https://socket.io/)
- **Auth Verification**: [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Google Cloud Project (for OAuth Client ID)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd clover
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install

   # Client dependencies
   cd client && npm install

   # Backend dependencies
   cd ../backend && npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

   Create a `.env` file in the `client` folder:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the Application**
   ```bash
   # From the root directory
   npm run dev
   ```
   This will start both the backend and frontend concurrently.

## 📂 Project Structure

```text
clover/
├── backend/            # Express server & API
│   ├── src/
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth & error handling
│   │   └── sockets/    # Real-time game logic
├── client/             # Vite + React frontend
│   ├── src/
│   │   ├── screens/    # Page components
│   │   ├── context/    # Global state (Zustand)
│   │   ├── services/   # API & WebSocket clients
│   │   └── assets/     # Images & styles
└── package.json        # Monorepo scripts
```

## 📜 License
MIT
