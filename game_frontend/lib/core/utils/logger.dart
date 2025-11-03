import 'dart:developer' as developer;

class Logger {
  static void debug(String message, {String? tag}) {
    developer.log(
      message,
      name: tag ?? 'DEBUG',
      time: DateTime.now(),
    );
  }

  static void info(String message, {String? tag}) {
    developer.log(
      message,
      name: tag ?? 'INFO',
      time: DateTime.now(),
    );
  }

  static void warning(String message, {String? tag}) {
    developer.log(
      message,
      name: tag ?? 'WARNING',
      time: DateTime.now(),
    );
  }

  static void error(String message, {String? tag, Object? error, StackTrace? stackTrace}) {
    developer.log(
      message,
      name: tag ?? 'ERROR',
      time: DateTime.now(),
      error: error,
      stackTrace: stackTrace,
    );
  }
}
