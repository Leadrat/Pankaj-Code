import 'package:dartz/dartz.dart';
import '../repositories/admin_repository.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';

class DeleteUserUseCase implements UseCase<void, DeleteUserParams> {
  final AdminRepository repository;

  DeleteUserUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(DeleteUserParams params) async {
    return await repository.deleteUser(params.userId);
  }
}

class DeleteUserParams {
  final int userId;

  const DeleteUserParams({required this.userId});

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is DeleteUserParams && other.userId == userId;
  }

  @override
  int get hashCode => userId.hashCode;
}
