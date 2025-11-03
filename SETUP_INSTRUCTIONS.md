# Complete Setup Instructions

## Overview
This document provides detailed step-by-step instructions to get the Tic-Tac-Toe application up and running.

## Prerequisites Installation

### 1. Install .NET 8 SDK
Download and install from: https://dotnet.microsoft.com/download/dotnet/8.0

Verify installation:
```bash
dotnet --version
```
Should show 8.0.x or later

### 2. Install Node.js
Download and install from: https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```
Should show Node v16+ and npm v8+

### 3. Install Entity Framework Tools
```bash
dotnet tool install --global dotnet-ef
```

Verify installation:
```bash
dotnet ef --version
```

## Backend Setup

### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\Pankaj Joshi\.net tic tac toe"
```

### Step 2: Restore Dependencies
```bash
dotnet restore TicTacToe.csproj
```

### Step 3: Build the Project
```bash
dotnet build TicTacToe.csproj
```

Expected output: `Build succeeded. 0 Warning(s) 0 Error(s)`

### Step 4: Create Database
```bash
dotnet ef database update
```

This will:
- Create SQLite database file `tictactoe.db`
- Create all necessary tables
- Seed the admin user

### Step 5: Run the Backend
```bash
dotnet run --project TicTacToe.csproj
```

Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[14]
      Application started. Press Ctrl+C to shut down.
```

**Keep this terminal running!**

You can test the API by opening:
- Swagger UI: http://localhost:5000/swagger
- Health check: http://localhost:5000

## Frontend Setup

### Open a NEW Terminal Window

### Step 1: Navigate to Frontend Directory
```bash
cd "c:\Users\Pankaj Joshi\.net tic tac toe\frontend"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all npm packages (takes 1-2 minutes)

Expected output: `added XXX packages, and audited XXX packages`

### Step 3: Start the React App
```bash
npm start
```

This will:
- Start the development server
- Open http://localhost:3000 in your browser
- Enable hot-reloading for development

Expected output:
```
Compiled successfully!
You can now view tic-tac-toe-frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## Application Access

### Web Interface
Open your browser and go to: **http://localhost:3000**

### API Documentation
Open Swagger UI: **http://localhost:5000/swagger**

## First Steps

### 1. Register a New Account
- Click "Register" on the landing page
- Fill in Username, Email, and Password (min 6 characters)
- Click "Register"
- You'll be redirected to login page

### 2. Login
- Enter your email and password
- Click "Sign in"
- You'll be taken to the game page

### 3. Play Your First Game
- Click "Play Now"
- Choose "Single Player (vs AI)" or "Two Player (Local)"
- Make your moves!
- Your scores will be automatically saved

### 4. View Your Scores
- Click "My Scores" in the navigation
- See your wins, losses, draws, and win rate

### 5. Admin Access (Optional)
- Logout and login with admin credentials:
  - Email: admin@tictactoe.com
  - Password: Admin@123
- Click "Admin Panel" to see all players
- View global statistics

## Configuration

### Changing Backend Port
Edit `appsettings.json`:
```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5001"
      }
    }
  }
}
```

Then update frontend API URL in `frontend/src/context/AuthContext.js`:
```javascript
await axios.post('http://localhost:5001/api/auth/login', {
  // ...
});
```

### Changing Frontend Port
React will prompt you if port 3000 is busy. Or set it explicitly:
```bash
PORT=3001 npm start
```

### Database Configuration
To use a different database:

**SQL Server:**
1. Install SQL Server
2. Update `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TicTacToe;Trusted_Connection=True;"
}
```
3. Update `Program.cs` to use `UseSqlServer` instead of `UseSqlite`

**PostgreSQL:**
1. Install PostgreSQL
2. Add package: `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`
3. Update connection string and use `UseNpgsql`

## Troubleshooting

### Issue: "dotnet ef" command not found
**Solution:**
```bash
dotnet tool install --global dotnet-ef
```

### Issue: Database migration fails
**Solution:**
1. Delete all `.db`, `.db-shm`, `.db-wal` files
2. Run `dotnet ef database update` again

### Issue: Port already in use (5000 or 3000)
**Solution:**
- Backend: Kill the process using port 5000:
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  ```
- Frontend: React will prompt to use another port (usually 3001)

### Issue: CORS errors in browser
**Solution:**
1. Ensure backend is running
2. Check `Program.cs` has CORS configured for `http://localhost:3000`
3. Clear browser cache and reload

### Issue: "Module not found" errors in frontend
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build errors in backend
**Solution:**
```bash
dotnet clean
dotnet restore
dotnet build
```

### Issue: Authentication not working
**Solution:**
1. Check browser console for errors
2. Verify backend is running on correct port
3. Check API URL in `AuthContext.js` matches backend port
4. Clear localStorage: `localStorage.clear()` in browser console

## Development Workflow

### Making Backend Changes
1. Edit .cs files in Controllers, Models, etc.
2. Save the file
3. The backend auto-reloads (if using `dotnet watch run`)
4. Changes are reflected immediately

### Making Frontend Changes
1. Edit .js/.jsx files in frontend/src
2. Save the file
3. Browser auto-reloads
4. See changes instantly

### Testing API Endpoints
1. Open http://localhost:5000/swagger
2. Click "Authorize" button
3. Enter JWT token (get from login response)
4. Try out endpoints

## Production Deployment

### Backend Deployment

**Azure App Service:**
1. Create Azure App Service
2. Set deployment source to GitHub/VS Code
3. Configure connection string
4. Deploy

**Render:**
1. Create new Web Service
2. Connect to GitHub repo
3. Build command: `dotnet publish -c Release -o ./publish`
4. Start command: `cd publish && dotnet TicTacToe.dll`
5. Add environment variables

### Frontend Deployment

**Build for Production:**
```bash
cd frontend
npm run build
```

**Deploy to Netlify:**
1. Drag and drop `frontend/build` folder
2. Or connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `build`

**Deploy to Vercel:**
1. Import project from GitHub
2. Framework preset: Create React App
3. Deploy

**Important:** Update API URL in `AuthContext.js` to production URL!

## Support

For more information:
- See [README.md](README.md) for general information
- See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [QUICKSTART.md](QUICKSTART.md) for a quick overview

## Next Steps After Setup

1. ✅ Verify everything works
2. ✅ Play a few games
3. ✅ Test admin features
4. ✅ Review the code
5. ✅ Customize as needed
6. ✅ Deploy to production

---

**You're all set! Enjoy your Tic-Tac-Toe application! 🎮**


