# Quick Start Guide

Get your Tic-Tac-Toe application running in minutes!

## Prerequisites Check

Make sure you have:
- ✅ .NET 8 SDK installed
- ✅ Node.js 16+ installed
- ✅ npm or yarn installed

## Step-by-Step Setup

### 1. Restore Backend Dependencies
```bash
dotnet restore TicTacToe.csproj
```

### 2. Build the Backend
```bash
dotnet build TicTacToe.csproj
```

### 3. Initialize Database
```bash
# First, install EF tools if you haven't already
dotnet tool install --global dotnet-ef

# Then create the database
dotnet ef database update
```

### 4. Start the Backend Server
```bash
dotnet run --project TicTacToe.csproj
```

The API will be running at: **http://localhost:5000**

### 5. Setup Frontend (in a new terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

The React app will open at: **http://localhost:3000**

## Default Login Credentials

### Admin Account
- **Email**: admin@tictactoe.com
- **Password**: Admin@123

### Regular Users
Register a new account from the landing page!

## Troubleshooting

### "dotnet ef" command not found
Install Entity Framework tools:
```bash
dotnet tool install --global dotnet-ef
```

### Database already exists error
Delete the `.db` files and run `dotnet ef database update` again

### Port already in use
- Backend: Change the port in `appsettings.json` or let .NET choose another
- Frontend: React will prompt you to use another port (usually 3001)

### CORS errors
Make sure the backend is running and allows requests from `http://localhost:3000` (configured in `Program.cs`)

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Click "Register" to create a new account
3. Or login with admin credentials
4. Click "Play Now" to start a game
5. Try both Single Player (vs AI) and Two Player modes
6. Check your scores in "My Scores"
7. If you're admin, visit the Admin Panel

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the game difficulty
- Deploy to Azure, Render, or Netlify
- Add more features!

---

**Happy Gaming! 🎮**


