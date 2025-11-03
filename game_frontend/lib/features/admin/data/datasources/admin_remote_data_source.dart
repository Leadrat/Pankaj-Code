import 'package:dio/dio.dart';
import '../models/admin_user_summary_model.dart';
import '../models/admin_statistics_model.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';

abstract class AdminRemoteDataSource {
  Future<List<AdminUserSummaryModel>> getAllUsers();
  Future<void> deleteUser(int userId);
  Future<void> resetUserScores(int userId);
  Future<void> resetAllScores();
  Future<AdminStatisticsModel> getStatistics();
  Future<AdminUserSummaryModel> getUserDetails(int userId);
}

class AdminRemoteDataSourceImpl implements AdminRemoteDataSource {
  final DioClient dioClient;

  AdminRemoteDataSourceImpl(this.dioClient);

  @override
  Future<List<AdminUserSummaryModel>> getAllUsers() async {
    try {
      final response = await dioClient.get(ApiConstants.adminUsers);
      
      final List<dynamic> jsonData = response.data;
      return jsonData
          .map((json) => AdminUserSummaryModel.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while fetching users');
    }
  }

  @override
  Future<void> deleteUser(int userId) async {
    try {
      await dioClient.delete('${ApiConstants.adminDeleteUser}/$userId');
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while deleting user');
    }
  }

  @override
  Future<void> resetUserScores(int userId) async {
    try {
      await dioClient.post('${ApiConstants.adminResetScores}/$userId');
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while resetting user scores');
    }
  }

  @override
  Future<void> resetAllScores() async {
    try {
      await dioClient.post(ApiConstants.adminResetScores);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while resetting all scores');
    }
  }

  @override
  Future<AdminStatisticsModel> getStatistics() async {
    try {
      final response = await dioClient.get(ApiConstants.adminSummary);
      return AdminStatisticsModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while fetching statistics');
    }
  }

  @override
  Future<AdminUserSummaryModel> getUserDetails(int userId) async {
    try {
      final response = await dioClient.get('${ApiConstants.adminUsers}/$userId');
      return AdminUserSummaryModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Unexpected error occurred while fetching user details');
    }
  }

  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Connection timeout. Please check your internet connection.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Unauthorized. Please login again.');
        } else if (statusCode == 403) {
          return Exception('Forbidden. You don\'t have permission to access this resource.');
        } else if (statusCode == 404) {
          return Exception('Resource not found.');
        } else if (statusCode! >= 500) {
          return Exception('Server error. Please try again later.');
        }
        return Exception(error.response?.data['message'] ?? 'Something went wrong');
      case DioExceptionType.cancel:
        return Exception('Request cancelled');
      case DioExceptionType.connectionError:
        return Exception('No internet connection');
      case DioExceptionType.unknown:
        return Exception('Something went wrong. Please try again');
      default:
        return Exception('Something went wrong. Please try again');
    }
  }
}
