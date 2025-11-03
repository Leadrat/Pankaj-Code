part of 'admin_bloc.dart';

abstract class AdminEvent extends Equatable {
  const AdminEvent();

  @override
  List<Object> get props => [];
}

class GetAllUsersRequested extends AdminEvent {
  const GetAllUsersRequested();
}

class DeleteUserRequested extends AdminEvent {
  final int userId;

  const DeleteUserRequested(this.userId);

  @override
  List<Object> get props => [userId];
}

class ResetUserScoresRequested extends AdminEvent {
  final int userId;

  const ResetUserScoresRequested(this.userId);

  @override
  List<Object> get props => [userId];
}

class ResetAllScoresRequested extends AdminEvent {
  const ResetAllScoresRequested();
}

class GetStatisticsRequested extends AdminEvent {
  const GetStatisticsRequested();
}

class RefreshDataRequested extends AdminEvent {
  const RefreshDataRequested();
}
