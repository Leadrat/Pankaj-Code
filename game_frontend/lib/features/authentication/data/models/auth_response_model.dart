import '../../domain/entities/auth_response.dart';
import '../../domain/entities/user.dart';

class AuthResponseModel extends AuthResponse {
  const AuthResponseModel({
    required super.token,
    required super.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      token: json['token'],
      user: UserModel.fromJson(json['user']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'role': user.role,
    };
  }
}

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.username,
    required super.email,
    required super.role,
    required super.createdAt,
    required super.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      role: json['role'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'createdAt': createdAt.toIso8601String(),
      'isActive': isActive,
    };
  }
}
