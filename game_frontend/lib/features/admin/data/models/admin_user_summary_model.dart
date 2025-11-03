import '../../domain/entities/admin_user_summary.dart';

class AdminUserSummaryModel extends AdminUserSummary {
  const AdminUserSummaryModel({
    required super.id,
    required super.username,
    required super.email,
    required super.role,
    required super.createdAt,
    required super.isActive,
    required super.totalScore,
    required super.wins,
    required super.losses,
    required super.draws,
  });

  factory AdminUserSummaryModel.fromJson(Map<String, dynamic> json) {
    return AdminUserSummaryModel(
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

  factory AdminUserSummaryModel.fromEntity(AdminUserSummary entity) {
    return AdminUserSummaryModel(
      id: entity.id,
      username: entity.username,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
      isActive: entity.isActive,
      totalScore: entity.totalScore,
      wins: entity.wins,
      losses: entity.losses,
      draws: entity.draws,
    );
  }
}
