import 'package:equatable/equatable.dart';
import 'user.dart';

class AuthResponse extends Equatable {
  final String token;
  final User user;

  const AuthResponse({
    required this.token,
    required this.user,
  });

  @override
  List<Object?> get props => [token, user];

  AuthResponse copyWith({
    String? token,
    User? user,
  }) {
    return AuthResponse(
      token: token ?? this.token,
      user: user ?? this.user,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'user': user.toJson(),
    };
  }

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      user: User.fromJson(json['user']),
    );
  }
}
