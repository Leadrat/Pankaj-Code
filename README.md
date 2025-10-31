# Game App - Full Stack Application

A complete full-stack game application with .NET 8 Web API backend and Flutter frontend following Clean Architecture principles.

## 🏗️ Architecture

### Backend (.NET 8 Web API)
- **Clean Architecture**: Domain, Application, Infrastructure, and Presentation layers
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT with User and Admin roles
- **API Documentation**: Swagger/OpenAPI
- **CORS**: Configured for Flutter frontend communication

### Frontend (Flutter)
- **Clean Architecture**: Features-based structure with BLoC pattern
- **State Management**: Flutter BLoC
- **UI**: Material 3 design with animations
- **Local Storage**: SharedPreferences for token caching
- **Network**: Dio for HTTP requests with interceptors

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- Flutter SDK
- Visual Studio Code / Visual Studio / Android Studio
- Android Emulator or Physical Device (for Flutter)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "mobile app"
   ```

2. **Backend Setup**
   ```bash
   cd GameBackend
   dotnet restore
   dotnet build
   ```

3. **Frontend Setup**
   ```bash
   cd game_frontend
   flutter pub get
   flutter doctor
   ```

### Running the Application

#### Option 1: Using the Startup Script
Simply run the batch file:
```bash
start_app.bat
```

#### Option 2: Manual Start

1. **Start the Backend**
   ```bash
   cd GameBackend
   dotnet run
   ```
   Backend will be available at: `http://localhost:5000`

2. **Start the Frontend** (in a new terminal)
   ```bash
   cd game_frontend
   flutter run
   ```

### API Documentation
Once the backend is running, you can access the Swagger documentation at:
`http://localhost:5000/swagger`

## 📱 Features

### Authentication
- User registration and login
- JWT token-based authentication
- Role-based authorization (User/Admin)
- Token caching and refresh

### User Management
- Profile management
- Score tracking
- Match history

### Admin Panel
- User management
- Score management
- System statistics

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=game.db"
  },
  "Jwt": {
    "Key": "ThisIsASecretKeyForJWTTokenGeneration123!@#",
    "Issuer": "GameBackend",
    "Audience": "GameFrontend"
  }
}
```

### Frontend Configuration
API endpoints are configured in `lib/core/constants/api_constants.dart`:
```dart
class ApiConstants {
  static const String baseUrl = 'http://localhost:5000/api';
  // ... other endpoints
}
```

## 🏗️ Project Structure

### Backend
```
GameBackend/
├── GameBackend.Domain/          # Entities and interfaces
├── GameBackend.Application/     # DTOs, services interfaces, use cases
├── GameBackend.Infrastructure/  # Data access, external services
├── GameBackend.Presentation/    # API controllers
└── GameBackend/                 # Main project and configuration
```

### Frontend
```
game_frontend/
├── lib/
│   ├── core/                    # Shared utilities and constants
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/
│   │   └── utils/
│   └── features/                # Feature-based modules
│       └── authentication/
│           ├── data/           # Data sources and repositories
│           ├── domain/         # Entities, use cases, repository interfaces
│           └── presentation/   # UI, BLoC, pages, widgets
```

## 🔐 Default Admin User
The application seeds a default admin user:
- **Username**: admin
- **Email**: admin@game.com
- **Password**: Admin123!

## 📊 Database
The application uses SQLite for data persistence. The database file (`game.db`) is created automatically when the backend starts.

## 🧪 Testing

### Backend Tests
```bash
cd GameBackend
dotnet test
```

### Frontend Tests
```bash
cd game_frontend
flutter test
```

## 🚀 Deployment

### Backend Deployment
- Build the application: `dotnet publish -c Release`
- Deploy to your preferred hosting service (IIS, Docker, Azure, etc.)

### Frontend Deployment
- Build the APK: `flutter build apk --release`
- Build for web: `flutter build web`
- Deploy to app stores or web hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure .NET 8 SDK is installed
   - Check if port 5000 is available
   - Run `dotnet restore` and `dotnet clean` then try again

2. **Flutter build errors**
   - Run `flutter clean` and `flutter pub get`
   - Ensure Android SDK is properly configured
   - Check if emulator/device is running

3. **CORS issues**
   - Ensure backend is running before starting frontend
   - Check CORS configuration in `Program.cs`

4. **Database connection issues**
   - Ensure the `game.db` file has proper permissions
   - Check the connection string in `appsettings.json`

## 📞 Support

For support and questions, please open an issue in the repository.
