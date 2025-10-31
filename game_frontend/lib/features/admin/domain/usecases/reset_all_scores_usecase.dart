import 'package:dartz/dartz.dart';
import '../repositories/admin_repository.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

class ResetAllScoresUseCase implements UseCase<void, NoParams> {
  final AdminRepository repository;

  ResetAllScoresUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) async {
    return await repository.resetAllScores();
  }
}
