# Tic-Tac-Toe Game - Full Stack Application

A full-stack Tic-Tac-Toe web application with AI opponent, authentication, score tracking, and admin dashboard.

## Features

### 🔐 Authentication
- User registration and login using ASP.NET Core Identity
- Secure JWT-based authentication
- Protected routes and role-based access

### 🎮 Game Modes
- **Single Player Mode**: Play against an intelligent AI using the Minimax algorithm
- **Two Player Mode**: Play with a friend on the same device

### 📊 Score Tracking
- Personal scoreboard showing wins, losses, and draws
- Win rate statistics
- Automatic score submission after each game

### 👑 Admin Dashboard
- View all registered players and their statistics
- Global game statistics
- Top players leaderboard

### 🎨 UI/UX Features
- Modern, responsive design using Tailwind CSS
- Dark/Light theme toggle
- Toast notifications for user feedback
- Mobile-friendly interface

## Tech Stack

### Backend
- **.NET 8** - ASP.NET Core Web API
- **Entity Framework Core** - ORM for database operations
- **SQLite** - Database (easily switchable to SQL Server/PostgreSQL)
- **ASP.NET Core Identity** - User authentication and authorization
- **JWT Bearer Authentication** - Secure API access
- **Swagger** - API documentation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Context API** - State management

## Prerequisites

- **.NET 8 SDK** or later
- **Node.js 16** or later
- **npm** or **yarn**

## Installation & Setup

### Backend Setup

1. Navigate to the project root directory.

2. Restore dependencies and build the project:
```bash
dotnet restore
dotnet build
```

3. Create the database:
```bash
dotnet ef database update
```

**Note**: If you haven't installed Entity Framework tools globally, install them first:
```bash
dotnet tool install --global dotnet-ef
```

4. Run the backend server:
```bash
dotnet run
```

The API will be available at `http://localhost:5000` or `https://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The React app will open at `http://localhost:3000`

## Default Admin Credentials

The application automatically creates an admin user on first run:

- **Email**: `admin@tictactoe.com`
- **Password**: `Admin@123`

**⚠️ Important**: Change this password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Game
- `POST /api/game/submit-score` - Submit game result (requires authentication)
- `GET /api/game/scores` - Get current user's scores (requires authentication)

### Admin
- `GET /api/admin/players` - Get all players with statistics (requires admin role)
- `GET /api/admin/statistics` - Get global statistics (requires admin role)

## Project Structure

```
.NET Tic Tac Toe/
├── frontend/                    # React application
│   ├── public/                  
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/              # Page components
│   │   │   ├── Landing.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Game.js
│   │   │   ├── Scoreboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── styles/             # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── Controllers/                 # API controllers
│   ├── AuthController.cs
│   ├── GameController.cs
│   └── AdminController.cs
├── Data/                       # Data layer
│   └── ApplicationDbContext.cs
├── Models/                     # Data models
│   ├── ApplicationUser.cs
│   ├── GameScore.cs
│   ├── LoginRequest.cs
│   ├── RegisterRequest.cs
│   ├── LoginResponse.cs
│   ├── SubmitScoreRequest.cs
│   └── PlayerStatsResponse.cs
├── Program.cs                  # Application entry point
├── appsettings.json           # Configuration
└── TicTacToe.csproj          # Project file
```

## Deployment

### Backend (Azure/Render)
1. Update `appsettings.json` with production database connection string
2. Deploy using Azure App Service or Render
3. Configure environment variables for JWT secret key

### Frontend
1. Build production bundle:
```bash
cd frontend
npm run build
```

2. Deploy `build` folder to:
   - Azure Static Web Apps
   - Netlify
   - Vercel
   - Or any static hosting service

3. Update API URL in `frontend/src/context/AuthContext.js` to point to your deployed backend

## AI Algorithm

The game uses the **Minimax algorithm** for optimal AI play:
- Minimax is a decision-making algorithm for turn-based games
- The AI explores all possible game states to find the best move
- This makes the AI unbeatable (it will either win or draw)

## Future Enhancements

- [ ] Online multiplayer mode
- [ ] Game history replay
- [ ] Achievement system
- [ ] Sound effects and animations
- [ ] Difficulty levels for AI
- [ ] Tournament mode
- [ ] Social features (friends, challenges)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Troubleshooting

### Database Issues
If you encounter database errors, delete the `.db` files and run `dotnet ef database update` again.

### CORS Issues
If you see CORS errors, ensure the backend is allowing requests from `http://localhost:3000` (check `Program.cs`).

### Authentication Issues
- Clear browser localStorage
- Ensure JWT token is being stored after login
- Check that API base URL is correct in `AuthContext.js`

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Happy Gaming! 🎮**


