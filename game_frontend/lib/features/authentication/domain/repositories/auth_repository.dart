import 'package:dartz/dartz.dart';
import '../entities/auth_response.dart';
import '../../../../core/errors/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthResponse>> login({
    required String username,
    required String password,
  });

  Future<Either<Failure, AuthResponse>> register({
    required String username,
    required String email,
    required String password,
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, bool>> isTokenValid();

  Future<Either<Failure, String?>> getStoredToken();

  Future<Either<Failure, void>> storeToken(String token);

  Future<Either<Failure, void>> clearStoredData();
}
