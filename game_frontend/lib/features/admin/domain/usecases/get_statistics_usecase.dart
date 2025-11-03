import 'package:dartz/dartz.dart';
import '../entities/admin_statistics.dart';
import '../repositories/admin_repository.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

class GetStatisticsUseCase implements UseCase<AdminStatistics, NoParams> {
  final AdminRepository repository;

  GetStatisticsUseCase(this.repository);

  @override
  Future<Either<Failure, AdminStatistics>> call(NoParams params) async {
    return await repository.getStatistics();
  }
}
