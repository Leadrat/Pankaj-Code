import 'package:equatable/equatable.dart';

class AdminStatistics extends Equatable {
  final int totalUsers;
  final int activeUsers;
  final int totalMatches;
  final int completedMatches;
  final int totalScore;
  final double averageScore;
  final DateTime lastUpdated;

  const AdminStatistics({
    required this.totalUsers,
    required this.activeUsers,
    required this.totalMatches,
    required this.completedMatches,
    required this.totalScore,
    required this.averageScore,
    required this.lastUpdated,
  });

  @override
  List<Object?> get props => [
        totalUsers,
        activeUsers,
        totalMatches,
        completedMatches,
        totalScore,
        averageScore,
        lastUpdated,
      ];

  AdminStatistics copyWith({
    int? totalUsers,
    int? activeUsers,
    int? totalMatches,
    int? completedMatches,
    int? totalScore,
    double? averageScore,
    DateTime? lastUpdated,
  }) {
    return AdminStatistics(
      totalUsers: totalUsers ?? this.totalUsers,
      activeUsers: activeUsers ?? this.activeUsers,
      totalMatches: totalMatches ?? this.totalMatches,
      completedMatches: completedMatches ?? this.completedMatches,
      totalScore: totalScore ?? this.totalScore,
      averageScore: averageScore ?? this.averageScore,
      lastUpdated: lastUpdated ?? this.lastUpdated,
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

  factory AdminStatistics.fromJson(Map<String, dynamic> json) {
    return AdminStatistics(
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

  double get activeUserRate {
    if (totalUsers == 0) return 0.0;
    return activeUsers / totalUsers;
  }

  double get matchCompletionRate {
    if (totalMatches == 0) return 0.0;
    return completedMatches / totalMatches;
  }
}
