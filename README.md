# Live Tic-Tac-Toe 🎮

A beautiful, real-time multiplayer Tic-Tac-Toe game with persistent scoreboards, match history, and replay functionality.

## ✨ Features

### 🔐 Authentication
- Email/password authentication with Convex Auth
- Persistent user profiles with stats tracking
- Secure session management

### 🎯 Real-time Multiplayer
- Create or join game rooms with shareable room IDs
- Real-time game state synchronization
- Low-latency move updates
- Automatic reconnection handling

### 📊 Persistent Scoreboard
- Track wins, losses, draws, and win rate
- Global leaderboard with top players
- Personal statistics dashboard
- Minimum 3 games required for leaderboard ranking

### 🎬 Match Replay System
- Complete move-by-move replay of finished games
- Playback controls (play/pause, step forward/back)
- Variable speed playback (0.5x to 4x)
- Visual move history timeline

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Beautiful gradient backgrounds and animations
- Intuitive game controls and visual feedback
- Real-time turn indicators and game status

### 🏆 Game Features
- Classic 3x3 Tic-Tac-Toe gameplay
- Turn-based mechanics with visual indicators
- Automatic win/draw detection
- Room-based matchmaking system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd live-tic-tac-toe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎮 How to Play

### Creating a Game
1. Sign up or sign in to your account
2. Click "Create Room" to start a new game
3. Share the generated room ID with your friend
4. Wait for them to join and mark ready
5. Start playing when both players are ready!

### Joining a Game
1. Get a room ID from your friend
2. Click "Join Room" and enter the room ID
3. Mark yourself as ready
4. Start playing when both players are ready!

### Gameplay
- Players take turns placing X's and O's
- First player to get 3 in a row wins
- Games can end in wins, losses, or draws
- All results are automatically saved to your stats

### Viewing Stats & History
- Check your personal statistics on the main dashboard
- View the global leaderboard to see top players
- Browse your match history and replay any game
- Use replay controls to analyze your games

## 🏗️ Technical Architecture

### Frontend
- **React 19** with TypeScript for type safety
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building
- **Convex React** for real-time data synchronization

### Backend
- **Convex** for database, real-time updates, and serverless functions
- **Convex Auth** for secure authentication
- Real-time subscriptions for live game updates
- Automatic data persistence and synchronization

### Database Schema
- **Users**: Authentication and profile data
- **Rooms**: Active game sessions with real-time state
- **Matches**: Completed game records with full move history
- **UserStats**: Persistent win/loss/draw statistics

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only Convex backend

### Project Structure

```
src/
├── components/          # React components
│   ├── GameBoard.tsx   # Tic-tac-toe board component
│   ├── GameLobby.tsx   # Main lobby interface
│   ├── GameRoom.tsx    # Active game room
│   ├── Leaderboard.tsx # Global rankings
│   ├── MatchHistory.tsx # Personal game history
│   └── ReplayViewer.tsx # Game replay system
├── App.tsx             # Main application component
└── main.tsx           # Application entry point

convex/
├── schema.ts          # Database schema definitions
├── games.ts           # Game logic and mutations
├── auth.ts            # Authentication functions
└── _generated/        # Auto-generated Convex files
```

## 🌟 Key Features Explained

### Real-time Synchronization
The game uses Convex's real-time database to ensure all players see updates instantly. When a player makes a move, it's immediately reflected for all participants without manual refreshing.

### Persistent Statistics
All game results are automatically saved and contribute to your permanent statistics. Win rates are calculated in real-time and displayed on the leaderboard.

### Replay System
Every move is recorded with timestamps, allowing for complete game reconstruction. The replay viewer lets you step through games move-by-move or watch them play automatically.

### Room-based Matchmaking
Games are organized into rooms with unique IDs. Players can easily share room codes to invite specific opponents, making it perfect for playing with friends.

## 🎯 Future Enhancements

Potential features for future versions:
- Spectator mode for watching games
- Tournament brackets and organized competitions
- Chat system within game rooms
- Customizable board sizes (4x4, 5x5)
- AI opponent for single-player practice
- Social features and friend lists

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

Built with ❤️ using Convex, React, and TypeScript
