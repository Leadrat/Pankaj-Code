import 'package:equatable/equatable.dart';

class AdminUserSummary extends Equatable {
  final int id;
  final String username;
  final String email;
  final String role;
  final DateTime createdAt;
  final bool isActive;
  final int totalScore;
  final int wins;
  final int losses;
  final int draws;

  const AdminUserSummary({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.createdAt,
    required this.isActive,
    required this.totalScore,
    required this.wins,
    required this.losses,
    required this.draws,
  });

  @override
  List<Object?> get props => [
        id,
        username,
        email,
        role,
        createdAt,
        isActive,
        totalScore,
        wins,
        losses,
        draws,
      ];

  AdminUserSummary copyWith({
    int? id,
    String? username,
    String? email,
    String? role,
    DateTime? createdAt,
    bool? isActive,
    int? totalScore,
    int? wins,
    int? losses,
    int? draws,
  }) {
    return AdminUserSummary(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      isActive: isActive ?? this.isActive,
      totalScore: totalScore ?? this.totalScore,
      wins: wins ?? this.wins,
      losses: losses ?? this.losses,
      draws: draws ?? this.draws,
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
      'totalScore': totalScore,
      'wins': wins,
      'losses': losses,
      'draws': draws,
    };
  }

  factory AdminUserSummary.fromJson(Map<String, dynamic> json) {
    return AdminUserSummary(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      role: json['role'],
      createdAt: DateTime.parse(json['createdAt']),
      isActive: json['isActive'] ?? true,
      totalScore: json['totalScore'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      draws: json['draws'] ?? 0,
    );
  }

  double get winRate {
    final totalGames = wins + losses + draws;
    if (totalGames == 0) return 0.0;
    return wins / totalGames;
  }

  bool get isAdmin => role.toLowerCase() == 'admin';
  bool get isUser => role.toLowerCase() == 'user';
}
