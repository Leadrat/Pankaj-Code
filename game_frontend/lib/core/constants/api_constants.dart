import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // Allow override via --dart-define=API_BASE_URL=http://<host>:<port>/api
  static const String _overrideBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

  // Do NOT import dart:io here (breaks web). Assume Android emulator for non-web if no override.
  static String get baseUrl {
    if (_overrideBaseUrl.isNotEmpty) return _overrideBaseUrl;
    if (kIsWeb) return 'http://localhost:5072/api';
    // Mobile/desktop default without override:
    // Android emulator maps host loopback to 10.0.2.2
    return 'http://10.0.2.2:5072/api';
  }
  
  // Auth endpoints
  static String get register => '$baseUrl/auth/register';
  static String get login => '$baseUrl/auth/login';
  static String get logout => '$baseUrl/auth/logout';
  
  // Score endpoints
  static String get scores => '$baseUrl/scores';
  static String get userScore => '$baseUrl/scores/user';
  
  // Admin endpoints
  static String get adminUsers => '$baseUrl/admin/users';
  static String get adminScores => '$baseUrl/admin/scores';
  static String get adminDeleteUser => '$baseUrl/admin/user';
  static String get adminResetScores => '$baseUrl/admin/reset-scores';
  static String get adminSummary => '$baseUrl/admin/summary';
}
