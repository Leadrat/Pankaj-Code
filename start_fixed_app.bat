@echo off
echo Starting Game Backend and Frontend...
echo.

echo Starting Backend Server on port 5072...
start "Game Backend" cmd /k "cd GameBackendFixed && dotnet run --urls http://0.0.0.0:5072"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Flutter Frontend...
cd game_frontend
flutter run -d chrome --web-port 8080

echo.
echo App is running!
echo Backend: http://localhost:5072/swagger
echo Frontend: http://localhost:8080
echo.
echo Login Credentials:
echo Admin: username=admin, password=Admin123!
echo.
