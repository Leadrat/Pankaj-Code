@echo off
echo Starting Game App Backend and Frontend...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd GameBackend && dotnet run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd game_frontend && flutter run"

echo.
echo Both applications are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available on your device/emulator
echo.
echo Press any key to exit...
pause >nul
