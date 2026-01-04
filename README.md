#🎮 Connect 4 – Real-Time Multiplayer Game

A **real-time Connect 4 game** built using **React+vite, Node.js, Socket.io, and MongoDB**.  
Players can play **PvP (Player vs Player)** with live updates and a **real-time leaderboard** tracking total wins per user.

---
## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
git clone https://github.com/Amu-Patel/4connectGame.git
cd connect-4
##Backend Setup
cd backend
npm install
Add .env
  MONGO_URI-$$$$$
  PORT=5000
start-> npm start or node index.js

## Frontend Setup
cd frontend
npm install
npm run dev
---
## 🚀 Features

- 🔴🟡 Classic Connect-4 gameplay (7×6 board)
- Real-time multiplayer using Socket.io
- Username-based players
- Live leaderboard (MongoDB)
- Automatic matchmaking
- Game state synchronization
- Win tracking per player
---
## 🛠️ Tech Stack
### Frontend
- TailwindCSS
- React+Vite
- Socket.io Client
- CSS

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB (Mongoose)

---

##How to Play
1. Open the app in two browser tabs or two devices
2. Enter a username
3. Get matched automatically with another player
    if Not, game start with Bot.
4. Take turns dropping discs
5. First player to connect 4 in a row wins
6. Winner is saved in the leaderboard
