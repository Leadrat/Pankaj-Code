class AppConstants {
  static const String appName = 'Game App';
  static const String appVersion = '1.0.0';
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String soundKey = 'sound_enabled';
  static const String vibrationKey = 'vibration_enabled';
  
  // Default values
  static const bool defaultSoundEnabled = true;
  static const bool defaultVibrationEnabled = true;
  
  // Game settings
  static const int maxPlayers = 2;
  static const int winScore = 100;
  static const Duration gameTimeout = Duration(minutes: 30);
  
  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 500);
  static const Duration longAnimation = Duration(milliseconds: 800);
  
  // Padding and margins
  static const double smallPadding = 8.0;
  static const double mediumPadding = 16.0;
  static const double largePadding = 24.0;
  static const double extraLargePadding = 32.0;
  
  // Border radius
  static const double smallRadius = 8.0;
  static const double mediumRadius = 12.0;
  static const double largeRadius = 16.0;
  static const double extraLargeRadius = 24.0;
}
