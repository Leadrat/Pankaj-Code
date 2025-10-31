import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth_response_model.dart';
import '../../../../core/constants/app_constants.dart';

abstract class AuthLocalDataSource {
  Future<void> cacheAuthData(AuthResponseModel authResponse);
  Future<void> cacheToken(String token);
  Future<void> cacheUser(AuthResponseModel user);
  Future<String?> getStoredToken();
  Future<AuthResponseModel?> getStoredUser();
  Future<void> clearCachedData();
  Future<bool> hasValidToken();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;

  AuthLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<void> cacheAuthData(AuthResponseModel authResponse) async {
    await sharedPreferences.setString(
      AppConstants.tokenKey,
      authResponse.token,
    );
    await sharedPreferences.setString(
      AppConstants.userKey,
      jsonEncode(authResponse.user.toJson()),
    );
  }

  @override
  Future<void> cacheToken(String token) async {
    await sharedPreferences.setString(AppConstants.tokenKey, token);
  }

  @override
  Future<void> cacheUser(AuthResponseModel user) async {
    await sharedPreferences.setString(
      AppConstants.userKey,
      jsonEncode(user.user.toJson()),
    );
  }

  @override
  Future<String?> getStoredToken() async {
    return sharedPreferences.getString(AppConstants.tokenKey);
  }

  @override
  Future<AuthResponseModel?> getStoredUser() async {
    final token = sharedPreferences.getString(AppConstants.tokenKey);
    final userJson = sharedPreferences.getString(AppConstants.userKey);
    if (userJson != null && token != null) {
      return AuthResponseModel(
        token: token,
        user: UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>),
      );
    }
    return null;
  }

  @override
  Future<void> clearCachedData() async {
    await sharedPreferences.remove(AppConstants.tokenKey);
    await sharedPreferences.remove(AppConstants.userKey);
  }

  @override
  Future<bool> hasValidToken() async {
    final token = sharedPreferences.getString(AppConstants.tokenKey);
    return token != null && token.isNotEmpty;
  }
}
