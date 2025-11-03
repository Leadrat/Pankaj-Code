import 'package:dartz/dartz.dart';
import '../entities/admin_user_summary.dart';
import '../repositories/admin_repository.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

class GetAllUsersUseCase implements UseCase<List<AdminUserSummary>, NoParams> {
  final AdminRepository repository;

  GetAllUsersUseCase(this.repository);

  @override
  Future<Either<Failure, List<AdminUserSummary>>> call(NoParams params) async {
    return await repository.getAllUsers();
  }
}
