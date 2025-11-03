# Architecture Overview

## System Architecture

This application follows a **client-server architecture** with a clear separation between frontend and backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │   Game Page  │  │  Admin Panel │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                                │
│                   ┌────────▼────────┐                      │
│                   │   AuthContext   │                      │
│                   │   ThemeContext  │                      │
│                   └────────┬────────┘                      │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Backend (ASP.NET Core)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  Auth    │  │  Game    │  │  Admin   │           │  │
│  │  │Controller│  │Controller│  │Controller│           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────▼────────────────────────────┐  │
│  │              Services Layer (EF Core)                 │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │         ASP.NET Core Identity                 │    │  │
│  │  │  (User Management & Authentication)           │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └─────────────────────────┬────────────────────────────┘  │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Database (SQLite)                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  ApplicationUser │  │   GameScore      │                │
│  │  - UserId        │  │   - GameId       │                │
│  │  - Username      │  │   - UserId       │                │
│  │  - Email         │  │   - Result       │                │
│  │  - Wins          │  │   - GameMode     │                │
│  │  - Losses        │  │   - PlayedAt     │                │
│  │  - Draws         │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend Architecture

**React 18 with Functional Components & Hooks**
- Uses modern React patterns (hooks, context)
- Component-based architecture for reusability
- Client-side routing with React Router

**State Management**
- **Context API**: Global state for authentication and theme
- **Local State**: Component-level state using useState
- **LocalStorage**: Persisting authentication tokens

**Key Frontend Files:**
```
frontend/src/
├── App.js                 # Main app component with routing
├── index.js              # Entry point
├── components/
│   ├── Navbar.js        # Navigation bar
│   └── PrivateRoute.js  # Route protection
├── context/
│   ├── AuthContext.js   # Authentication state management
│   └── ThemeContext.js  # Dark/light theme management
└── pages/
    ├── Landing.js       # Homepage
    ├── Login.js         # Login form
    ├── Register.js      # Registration form
    ├── Game.js          # Tic-Tac-Toe game with AI
    ├── Scoreboard.js    # User statistics
    └── AdminDashboard.js # Admin panel
```

### Backend Architecture

**ASP.NET Core Web API**
- RESTful API design
- MVC pattern (Models, Views, Controllers)
- Dependency Injection throughout

**Key Backend Files:**
```
├── Controllers/
│   ├── AuthController.cs      # /api/auth endpoints
│   ├── GameController.cs      # /api/game endpoints
│   └── AdminController.cs     # /api/admin endpoints
├── Models/
│   ├── ApplicationUser.cs     # Extended Identity user
│   ├── GameScore.cs           # Game history model
│   ├── LoginRequest.cs        # DTO for login
│   ├── RegisterRequest.cs     # DTO for registration
│   └── ...
├── Data/
│   └── ApplicationDbContext.cs # EF Core DbContext
└── Program.cs                  # App configuration & DI
```

## Authentication Flow

```
1. User submits credentials → Frontend
2. POST /api/auth/login → Backend
3. Validate credentials → ASP.NET Identity
4. Generate JWT token → Backend
5. Return token → Frontend
6. Store token in localStorage
7. Add token to all API requests
8. Validate token on protected routes
```

## Authorization

**Role-Based Access Control (RBAC)**
- Regular users: Can play games and view own scores
- Admin users: Can access admin panel and view all users

Implementation:
- JWT tokens include role claims
- Backend controllers use `[Authorize(Roles = "Admin")]`
- Frontend checks role before showing admin links

## AI Algorithm

**Minimax Algorithm**
- Perfect play algorithm for zero-sum games
- Explores all possible game states
- Optimal decision-making for AI

How it works:
1. Recursively evaluate all possible moves
2. Score each game state:
   - AI wins: +10
   - Player wins: -10
   - Draw: 0
3. Choose the move with the best score

## Data Flow

**Game Score Submission:**
```
User plays game → Frontend detects win/loss/draw
→ POST /api/game/submit-score → Backend
→ Update ApplicationUser stats (Wins, Losses, Draws)
→ Save GameScore record → Database
→ Return success → Frontend shows confirmation
```

## API Endpoints

**Public Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user

**Authenticated Endpoints:**
- `POST /api/game/submit-score` - Submit game result
- `GET /api/game/scores` - Get user's statistics

**Admin Endpoints:**
- `GET /api/admin/players` - List all players
- `GET /api/admin/statistics` - Global statistics

## Security Features

1. **Password Hashing**: ASP.NET Identity uses bcrypt
2. **JWT Tokens**: Secure, stateless authentication
3. **CORS**: Configured for frontend domain only
4. **SQL Injection Protection**: Entity Framework parameterized queries
5. **XSS Protection**: React escapes user input by default

## Database Schema

**ApplicationUser** (extends IdentityUser)
- Inherits: UserId, UserName, Email, PasswordHash, etc.
- Additional: Wins, Losses, Draws, CreatedAt

**GameScore**
- GameId (Primary Key)
- UserId (Foreign Key → ApplicationUser)
- GameMode (SinglePlayer/TwoPlayer)
- Result (Win/Loss/Draw)
- PlayedAt (DateTime)

**Relationships:**
- One-to-Many: User → GameScores

## Deployment Architecture

**Recommended Setup:**

**Backend (Azure/Render)**
- ASP.NET Core Web API
- SQLite for development
- SQL Server/PostgreSQL for production
- Environment variables for secrets

**Frontend (Netlify/Vercel/Azure Static Web Apps)**
- Built React SPA
- Environment variables for API URL
- CDN for static assets

## Performance Considerations

1. **Minimax Optimization**: Could implement alpha-beta pruning
2. **Caching**: Consider caching for leaderboard
3. **Database Indexing**: Index on UserId for GameScore lookups
4. **Frontend Bundle**: Code splitting for better performance
5. **API Response**: Pagination for large datasets

## Future Scalability

**Short-term:**
- Add database indexes
- Implement caching layer
- Optimize AI algorithm

**Long-term:**
- Implement Redis for session management
- Add WebSocket support for real-time multiplayer
- Migrate to microservices architecture
- Add API rate limiting
- Implement CDN for static assets

---

This architecture is designed to be maintainable, scalable, and secure while keeping the codebase simple and understandable.


