@echo off
echo Testing Game App Integration...
echo.

echo Step 1: Testing Backend Build...
cd /d "c:\Users\Pankaj Joshi\mobile app\GameBackend"
dotnet build --verbosity quiet
if %ERRORLEVEL% neq 0 (
    echo Backend build failed!
    pause
    exit /b 1
)
echo Backend build: SUCCESS

echo.
echo Step 2: Testing Frontend Build...
cd /d "c:\Users\Pankaj Joshi\mobile app\game_frontend"
flutter build apk --debug
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build: SUCCESS

echo.
echo Step 3: Checking Project Structure...
echo Backend Structure:
dir "c:\Users\Pankaj Joshi\mobile app\GameBackend" /b
echo.
echo Frontend Structure:
dir "c:\Users\Pankaj Joshi\mobile app\game_frontend\lib" /b

echo.
echo Step 4: Checking Configuration Files...
echo Backend appsettings.json:
type "c:\Users\Pankaj Joshi\mobile app\GameBackend\appsettings.json"
echo.
echo Frontend pubspec.yaml dependencies:
type "c:\Users\Pankaj Joshi\mobile app\game_frontend\pubspec.yaml" | findstr "dependencies:"

echo.
echo Integration Test Complete!
echo.
echo To run the full application:
echo 1. Run backend: cd GameBackend && dotnet run
echo 2. Run frontend: cd game_frontend && flutter run
echo 3. Or use: start_app.bat
echo.
pause
