import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
  }) : super(const AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<AuthStatusChecked>(_onAuthStatusChecked);
    on<AuthTokenRefreshed>(_onAuthTokenRefreshed);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final result = await loginUseCase(LoginParams(
      username: event.username,
      password: event.password,
    ));

    emit(result.fold(
      (failure) => AuthError(_mapFailureToMessage(failure)),
      (authResponse) => Authenticated(
        user: authResponse.user,
        token: authResponse.token,
      ),
    ));
  }

  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final result = await registerUseCase(RegisterParams(
      username: event.username,
      email: event.email,
      password: event.password,
    ));

    emit(result.fold(
      (failure) => AuthError(_mapFailureToMessage(failure)),
      (authResponse) => Authenticated(
        user: authResponse.user,
        token: authResponse.token,
      ),
    ));
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    
    final result = await logoutUseCase(NoParams());

    emit(result.fold(
      (failure) => AuthError(_mapFailureToMessage(failure)),
      (_) => const Unauthenticated(),
    ));
  }

  Future<void> _onAuthStatusChecked(
    AuthStatusChecked event,
    Emitter<AuthState> emit,
  ) async {
    // This would typically check if there's a valid token stored
    // For now, we'll emit Unauthenticated
    emit(const Unauthenticated());
  }

  Future<void> _onAuthTokenRefreshed(
    AuthTokenRefreshed event,
    Emitter<AuthState> emit,
  ) async {
    // This would typically refresh the token
    // For now, we'll just emit the current state
    if (state is Authenticated) {
      final currentState = state as Authenticated;
      emit(Authenticated(
        user: currentState.user,
        token: event.token,
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
