import 'package:dartz/dartz.dart';
import '../entities/admin_user_summary.dart';
import '../entities/admin_statistics.dart';
import '../../../../core/errors/failures.dart';

abstract class AdminRepository {
  Future<Either<Failure, List<AdminUserSummary>>> getAllUsers();
  Future<Either<Failure, void>> deleteUser(int userId);
  Future<Either<Failure, void>> resetUserScores(int userId);
  Future<Either<Failure, void>> resetAllScores();
  Future<Either<Failure, AdminStatistics>> getStatistics();
  Future<Either<Failure, AdminUserSummary>> getUserDetails(int userId);
}
