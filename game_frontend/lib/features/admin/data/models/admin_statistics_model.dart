import '../../domain/entities/admin_statistics.dart';

class AdminStatisticsModel extends AdminStatistics {
  const AdminStatisticsModel({
    required super.totalUsers,
    required super.activeUsers,
    required super.totalMatches,
    required super.completedMatches,
    required super.totalScore,
    required super.averageScore,
    required super.lastUpdated,
  });

  factory AdminStatisticsModel.fromJson(Map<String, dynamic> json) {
    return AdminStatisticsModel(
      totalUsers: json['totalUsers'] ?? 0,
      activeUsers: json['activeUsers'] ?? 0,
      totalMatches: json['totalMatches'] ?? 0,
      completedMatches: json['completedMatches'] ?? 0,
      totalScore: json['totalScore'] ?? 0,
      averageScore: (json['averageScore'] is num)
          ? (json['averageScore'] as num).toDouble()
          : 0.0,
      lastUpdated: (json['lastUpdated'] is String && (json['lastUpdated'] as String).isNotEmpty)
          ? DateTime.tryParse(json['lastUpdated']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalUsers': totalUsers,
      'activeUsers': activeUsers,
      'totalMatches': totalMatches,
      'completedMatches': completedMatches,
      'totalScore': totalScore,
      'averageScore': averageScore,
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }

  factory AdminStatisticsModel.fromEntity(AdminStatistics entity) {
    return AdminStatisticsModel(
      totalUsers: entity.totalUsers,
      activeUsers: entity.activeUsers,
      totalMatches: entity.totalMatches,
      completedMatches: entity.completedMatches,
      totalScore: entity.totalScore,
      averageScore: entity.averageScore,
      lastUpdated: entity.lastUpdated,
    );
  }
}
