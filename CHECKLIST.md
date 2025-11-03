# Tic-Tac-Toe Project Setup Checklist

Use this checklist to verify your setup is complete and working correctly.

## Initial Setup

- [ ] .NET 8 SDK installed (`dotnet --version` shows 8.0.x)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] EF Tools installed (`dotnet ef --version`)

## Backend Setup

- [ ] Navigated to project directory
- [ ] Restored dependencies (`dotnet restore`)
- [ ] Project builds successfully (`dotnet build`)
- [ ] Database created (`dotnet ef database update`)
- [ ] Backend starts without errors (`dotnet run`)
- [ ] API accessible at http://localhost:5000
- [ ] Swagger UI works at http://localhost:5000/swagger

## Frontend Setup

- [ ] Navigated to frontend directory
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend starts successfully (`npm start`)
- [ ] React app opens at http://localhost:3000
- [ ] No console errors in browser

## Authentication Testing

- [ ] Landing page loads correctly
- [ ] Can navigate to Register page
- [ ] Can register a new account
- [ ] Registration redirects to Login page
- [ ] Can login with registered account
- [ ] Login redirects to Game page
- [ ] Token stored in localStorage

## Game Functionality Testing

- [ ] Can access Game page after login
- [ ] Game mode selection appears
- [ ] Can select Single Player mode
- [ ] Game board displays correctly
- [ ] Can make moves as X
- [ ] AI makes moves as O
- [ ] Game detects win correctly
- [ ] Game detects draw correctly
- [ ] Restart button works
- [ ] Change Mode button works
- [ ] Can play Two Player mode
- [ ] Two players can alternate turns
- [ ] Score automatically submits to backend

## Scoreboard Testing

- [ ] Can navigate to My Scores page
- [ ] Scores display correctly (wins, losses, draws)
- [ ] Total games calculated correctly
- [ ] Win rate displays and updates
- [ ] Progress bars render correctly

## Admin Panel Testing

- [ ] Can logout from regular account
- [ ] Can login with admin credentials
  - Email: admin@tictactoe.com
  - Password: Admin@123
- [ ] Admin Panel link appears in navigation
- [ ] Can access Admin Dashboard
- [ ] All players list displays
- [ ] Statistics show correct totals
- [ ] Top players leaderboard shows

## UI/UX Testing

- [ ] Navigation bar works on all pages
- [ ] Logo/title links to landing page
- [ ] Logout button works
- [ ] Dark/Light theme toggle works
- [ ] Theme persists after refresh
- [ ] Toast notifications appear
  - Login success
  - Registration success
  - Game completion
- [ ] Page responsive on desktop
- [ ] Page responsive on mobile/resized window
- [ ] No broken styles or layout issues

## API Testing (Using Swagger)

- [ ] Can access Swagger UI
- [ ] POST /api/auth/register works
- [ ] POST /api/auth/login returns JWT token
- [ ] Can authorize with JWT token
- [ ] POST /api/game/submit-score works (authenticated)
- [ ] GET /api/game/scores returns user data (authenticated)
- [ ] GET /api/admin/players returns all players (admin only)
- [ ] GET /api/admin/statistics returns stats (admin only)

## Error Handling Testing

- [ ] Login with wrong password shows error
- [ ] Registration with invalid data shows validation errors
- [ ] Trying to access protected route redirects to login
- [ ] Trying to access admin panel as regular user redirects
- [ ] API errors are handled gracefully
- [ ] Toast notifications show errors

## Cross-Browser Testing (Optional)

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in Safari (if on Mac)

## Mobile Testing (Optional)

- [ ] Responsive on mobile devices
- [ ] Game board usable on small screen
- [ ] Navigation works on mobile
- [ ] Touch interactions work correctly

## Security Testing

- [ ] Cannot access API without authentication token
- [ ] Cannot access admin endpoints as regular user
- [ ] JWT tokens expire after 7 days (test if possible)
- [ ] Passwords not stored in plain text
- [ ] CORS configured correctly

## Database Testing

- [ ] SQLite database file created (tictactoe.db)
- [ ] Admin user exists in database
- [ ] New users saved to database
- [ ] Game scores saved to database
- [ ] Statistics update correctly

## Code Quality

- [ ] No TypeScript/JavaScript errors in console
- [ ] No C# compilation errors
- [ ] No linter warnings
- [ ] Code is formatted consistently
- [ ] Comments where necessary

## Documentation Review

- [ ] README.md reviewed
- [ ] QUICKSTART.md reviewed
- [ ] SETUP_INSTRUCTIONS.md reviewed
- [ ] ARCHITECTURE.md reviewed
- [ ] All instructions clear and accurate

## Deployment Preparation (If Deploying)

- [ ] Database connection string configured
- [ ] JWT secret key changed from default
- [ ] CORS configured for production domain
- [ ] Frontend API URL updated for production
- [ ] Environment variables set
- [ ] Build process tested (`npm run build`)
- [ ] Production build tested locally

## Final Checks

- [ ] All core functionality working
- [ ] No critical bugs found
- [ ] Application feels stable
- [ ] User experience is smooth
- [ ] Ready for production use

## Notes

Use this section to record any issues or observations:

```
Issue/Observation: ___________________________________
Steps to Reproduce: _________________________________
Resolution: _________________________________________
```

## Completion Status

- **Total Items**: 50+
- **Completed**: ___
- **Remaining**: ___
- **Overall Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

---

**When all items are checked, your Tic-Tac-Toe application is fully functional! 🎉**


