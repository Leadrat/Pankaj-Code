part of 'admin_bloc.dart';

abstract class AdminState extends Equatable {
  const AdminState();

  @override
  List<Object> get props => [];
}

class AdminInitial extends AdminState {
  const AdminInitial();
}

class AdminLoading extends AdminState {
  const AdminLoading();
}

class AdminUsersLoaded extends AdminState {
  final List<AdminUserSummary> users;

  const AdminUsersLoaded(this.users);

  @override
  List<Object> get props => [users];
}

class AdminStatisticsLoaded extends AdminState {
  final AdminStatistics statistics;

  const AdminStatisticsLoaded(this.statistics);

  @override
  List<Object> get props => [statistics];
}

class AdminDataLoaded extends AdminState {
  final List<AdminUserSummary> users;
  final AdminStatistics statistics;

  const AdminDataLoaded({
    required this.users,
    required this.statistics,
  });

  @override
  List<Object> get props => [users, statistics];

  AdminDataLoaded copyWith({
    List<AdminUserSummary>? users,
    AdminStatistics? statistics,
  }) {
    return AdminDataLoaded(
      users: users ?? this.users,
      statistics: statistics ?? this.statistics,
    );
  }
}

class AdminUserDeleted extends AdminState {
  final int userId;

  const AdminUserDeleted(this.userId);

  @override
  List<Object> get props => [userId];
}

class AdminScoresReset extends AdminState {
  const AdminScoresReset();
}

class AdminError extends AdminState {
  final String message;

  const AdminError(this.message);

  @override
  List<Object> get props => [message];
}
