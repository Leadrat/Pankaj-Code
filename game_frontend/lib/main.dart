import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

import 'core/constants/app_constants.dart';
import 'core/network/dio_client.dart';
import 'core/network/network_info.dart';
import 'features/authentication/presentation/bloc/auth_bloc.dart';
import 'features/authentication/presentation/pages/login_page.dart';
import 'features/authentication/presentation/pages/register_page.dart';
import 'features/authentication/domain/usecases/login_usecase.dart';
import 'features/authentication/domain/usecases/register_usecase.dart';
import 'features/authentication/domain/usecases/logout_usecase.dart';
import 'features/authentication/data/repositories/auth_repository_impl.dart';
import 'features/authentication/data/datasources/auth_remote_data_source.dart';
import 'features/authentication/data/datasources/auth_local_data_source.dart';
import 'features/admin/presentation/bloc/admin_bloc.dart';
import 'features/admin/presentation/pages/admin_dashboard_page.dart';
import 'features/game/presentation/pages/game_page.dart';
import 'features/admin/domain/usecases/get_all_users_usecase.dart';
import 'features/admin/domain/usecases/delete_user_usecase.dart';
import 'features/admin/domain/usecases/reset_all_scores_usecase.dart';
import 'features/admin/domain/usecases/get_statistics_usecase.dart';
import 'features/admin/data/repositories/admin_repository_impl.dart';
import 'features/admin/data/datasources/admin_remote_data_source.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final sharedPreferences = await SharedPreferences.getInstance();
  
  runApp(MyApp(sharedPreferences: sharedPreferences));
}

class MyApp extends StatelessWidget {
  final SharedPreferences sharedPreferences;

  const MyApp({
    super.key,
    required this.sharedPreferences,
  });

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (context) => _createAuthRepository(),
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => _createAuthBloc(context),
          ),
          BlocProvider(
            create: (context) => _createAdminBloc(context),
          ),
        ],
        child: MaterialApp(
          title: AppConstants.appName,
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blue,
              brightness: Brightness.light,
            ),
            scaffoldBackgroundColor: Colors.white,
            textTheme: const TextTheme(
              bodyLarge: TextStyle(color: Colors.black),
              bodyMedium: TextStyle(color: Colors.black87),
              titleLarge: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
            ),
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              centerTitle: true,
              elevation: 0,
              backgroundColor: Colors.transparent,
              foregroundColor: Colors.black,
            ),
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: Colors.grey[50],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Colors.blue,
                  width: 2,
                ),
              ),
            ),
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blue,
              brightness: Brightness.dark,
            ),
            scaffoldBackgroundColor: const Color(0xFF0F1115),
            textTheme: const TextTheme(
              bodyLarge: TextStyle(color: Colors.white),
              bodyMedium: TextStyle(color: Colors.white70),
              titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              centerTitle: true,
              elevation: 0,
              backgroundColor: Colors.transparent,
              foregroundColor: Colors.white,
            ),
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[700],
                foregroundColor: Colors.white,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: Colors.grey[800],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Colors.blue,
                  width: 2,
                ),
              ),
            ),
          ),
          themeMode: ThemeMode.system,
          initialRoute: '/login',
          routes: {
            '/login': (context) => const LoginPage(),
            '/register': (context) => const RegisterPage(),
            '/home': (context) => const HomePage(),
            '/admin': (context) => const AdminDashboardPage(),
            '/game': (context) => const GamePage(),
          },
        ),
      ),
    );
  }

  AuthRepositoryImpl _createAuthRepository() {
    final dioClient = DioClient();
    final networkInfo = NetworkInfoImpl(
      connectionChecker: InternetConnectionChecker.createInstance(),
    );
    
    return AuthRepositoryImpl(
      remoteDataSource: AuthRemoteDataSourceImpl(dioClient),
      localDataSource: AuthLocalDataSourceImpl(sharedPreferences),
      networkInfo: networkInfo,
    );
  }

  AuthBloc _createAuthBloc(BuildContext context) {
    final repository = context.read<AuthRepositoryImpl>();
    
    return AuthBloc(
      loginUseCase: LoginUseCase(repository),
      registerUseCase: RegisterUseCase(repository),
      logoutUseCase: LogoutUseCase(repository),
    );
  }

  AdminBloc _createAdminBloc(BuildContext context) {
    final adminRepository = _createAdminRepository();
    
    return AdminBloc(
      getAllUsersUseCase: GetAllUsersUseCase(adminRepository),
      deleteUserUseCase: DeleteUserUseCase(adminRepository),
      resetAllScoresUseCase: ResetAllScoresUseCase(adminRepository),
      getStatisticsUseCase: GetStatisticsUseCase(adminRepository),
    );
  }

  AdminRepositoryImpl _createAdminRepository() {
    final dioClient = DioClient();
    final networkInfo = NetworkInfoImpl(
      connectionChecker: InternetConnectionChecker.createInstance(),
    );
    
    return AdminRepositoryImpl(
      remoteDataSource: AdminRemoteDataSourceImpl(dioClient),
      networkInfo: networkInfo,
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is Unauthenticated) {
          Navigator.pushReplacementNamed(context, '/login');
        }
      },
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is Authenticated) {
            return Scaffold(
              appBar: AppBar(
                title: const Text('Game App'),
                actions: [
                  if (state.user.isAdmin)
                    IconButton(
                      icon: const Icon(Icons.admin_panel_settings),
                      onPressed: () {
                        Navigator.pushNamed(context, '/admin');
                      },
                    ),
                  IconButton(
                    icon: const Icon(Icons.logout),
                    onPressed: () {
                      context.read<AuthBloc>().add(LogoutRequested());
                    },
                  ),
                ],
              ),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.games,
                      size: 100,
                      color: Colors.blue,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Welcome, ${state.user.username}!',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      state.user.isAdmin ? 'Administrator' : 'Player',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushNamed(context, '/game');
                      },
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('Start Game'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                    ),
                    if (state.user.isAdmin) ...[
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pushNamed(context, '/admin');
                        },
                        icon: const Icon(Icons.admin_panel_settings),
                        label: const Text('Admin Panel'),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }
          
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        },
      ),
    );
  }
}
