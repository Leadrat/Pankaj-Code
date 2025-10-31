using GameBackend.Application.DTOs;

namespace GameBackend.Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<bool> LogoutAsync(string token);
    Task<bool> ValidateTokenAsync(string token);
    Task<string?> GetUsernameFromTokenAsync(string token);
    Task<string?> GetRoleFromTokenAsync(string token);
}
