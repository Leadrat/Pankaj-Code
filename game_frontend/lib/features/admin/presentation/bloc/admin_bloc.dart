import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/admin_user_summary.dart';
import '../../domain/entities/admin_statistics.dart';
import '../../domain/usecases/get_all_users_usecase.dart';
import '../../domain/usecases/delete_user_usecase.dart';
import '../../domain/usecases/reset_all_scores_usecase.dart';
import '../../domain/usecases/get_statistics_usecase.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

part 'admin_event.dart';
part 'admin_state.dart';

class AdminBloc extends Bloc<AdminEvent, AdminState> {
  final GetAllUsersUseCase getAllUsersUseCase;
  final DeleteUserUseCase deleteUserUseCase;
  final ResetAllScoresUseCase resetAllScoresUseCase;
  final GetStatisticsUseCase getStatisticsUseCase;

  AdminBloc({
    required this.getAllUsersUseCase,
    required this.deleteUserUseCase,
    required this.resetAllScoresUseCase,
    required this.getStatisticsUseCase,
  }) : super(const AdminInitial()) {
    on<GetAllUsersRequested>(_onGetAllUsersRequested);
    on<DeleteUserRequested>(_onDeleteUserRequested);
    on<ResetUserScoresRequested>(_onResetUserScoresRequested);
    on<ResetAllScoresRequested>(_onResetAllScoresRequested);
    on<GetStatisticsRequested>(_onGetStatisticsRequested);
    on<RefreshDataRequested>(_onRefreshDataRequested);
  }

  Future<void> _onGetAllUsersRequested(
    GetAllUsersRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    final result = await getAllUsersUseCase(NoParams());

    emit(result.fold(
      (failure) => AdminError(_mapFailureToMessage(failure)),
      (users) => AdminUsersLoaded(users),
    ));
  }

  Future<void> _onDeleteUserRequested(
    DeleteUserRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    final result = await deleteUserUseCase(DeleteUserParams(userId: event.userId));

    emit(result.fold(
      (failure) => AdminError(_mapFailureToMessage(failure)),
      (_) => AdminUserDeleted(event.userId),
    ));
  }

  Future<void> _onResetUserScoresRequested(
    ResetUserScoresRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    // This would typically call a reset user scores use case
    // For now, we'll emit success
    emit(const AdminScoresReset());
  }

  Future<void> _onResetAllScoresRequested(
    ResetAllScoresRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    final result = await resetAllScoresUseCase(NoParams());

    emit(result.fold(
      (failure) => AdminError(_mapFailureToMessage(failure)),
      (_) => const AdminScoresReset(),
    ));
  }

  Future<void> _onGetStatisticsRequested(
    GetStatisticsRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    final result = await getStatisticsUseCase(NoParams());

    emit(result.fold(
      (failure) => AdminError(_mapFailureToMessage(failure)),
      (statistics) => AdminStatisticsLoaded(statistics),
    ));
  }

  Future<void> _onRefreshDataRequested(
    RefreshDataRequested event,
    Emitter<AdminState> emit,
  ) async {
    emit(const AdminLoading());
    
    final usersResult = await getAllUsersUseCase(NoParams());
    final statsResult = await getStatisticsUseCase(NoParams());

    if (usersResult.isLeft() || statsResult.isLeft()) {
      final failure = usersResult.fold((l) => l, (r) => null) ??
                     statsResult.fold((l) => l, (r) => null)!;
      emit(AdminError(_mapFailureToMessage(failure)));
    } else {
      final users = usersResult.getOrElse(() => []);
      final statistics = statsResult.getOrElse(() => throw Exception());
      
      emit(AdminDataLoaded(
        users: users,
        statistics: statistics,
      ));
    }
  }

  String _mapFailureToMessage(Failure failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return 'Server error occurred. Please try again later.';
      case NetworkFailure:
        return 'No internet connection. Please check your network.';
      case CacheFailure:
        return 'Cache error occurred. Please try again.';
      case ValidationFailure:
        return failure.message;
      case AuthenticationFailure:
        return failure.message;
      case AuthorizationFailure:
        return 'You don\'t have permission to perform this action.';
      case UnknownFailure:
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
