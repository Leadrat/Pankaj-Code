import 'package:dio/dio.dart';
import '../models/auth_response_model.dart';
import '../models/login_request_model.dart';
import '../models/register_request_model.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login(LoginRequestModel request);
  Future<AuthResponseModel> register(RegisterRequestModel request);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;

  AuthRemoteDataSourceImpl(this.dioClient);

  @override
  Future<AuthResponseModel> login(LoginRequestModel request) async {
    try {
      final response = await dioClient.post(
        ApiConstants.login,
        data: request.toJson(),
      );

      return AuthResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw UnknownException('Unexpected error occurred during login');
    }
  }

  @override
  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    try {
      final response = await dioClient.post(
        ApiConstants.register,
        data: request.toJson(),
      );

      return AuthResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw UnknownException('Unexpected error occurred during registration');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await dioClient.post(ApiConstants.logout);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw UnknownException('Unexpected error occurred during logout');
    }
  }

  AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const NetworkException('No internet connection or request timed out.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 401) {
          return const AuthenticationException('Invalid username or password');
        } else if (statusCode == 403) {
          return const AuthorizationException("You don't have permission to perform this action.");
        } else if (statusCode == 400) {
          final message = (error.response?.data is Map<String, dynamic>)
              ? (error.response?.data['message'] as String?)
              : null;
          return ValidationException(message ?? 'Bad request');
        } else if (statusCode != null && statusCode >= 500) {
          return const ServerException('Server error. Please try again later.');
        }
        final message = (error.response?.data is Map<String, dynamic>)
            ? (error.response?.data['message'] as String?)
            : null;
        return ServerException(message ?? 'Something went wrong');
      case DioExceptionType.cancel:
        return const UnknownException('Request cancelled');
      case DioExceptionType.unknown:
      default:
        return const UnknownException('Something went wrong. Please try again');
    }
  }
}
