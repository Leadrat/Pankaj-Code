using GameBackend.Application.DTOs;

namespace GameBackend.Application.Services;

public interface IAdminService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<IEnumerable<ScoreDto>> GetAllScoresAsync();
    Task<bool> DeleteUserAsync(int userId);
    Task<bool> ResetAllScoresAsync();
    Task<AdminSummaryDto> GetSummaryAsync();
}

public class AdminSummaryDto
{
    public int TotalUsers { get; set; }
    public int TotalMatches { get; set; }
    public int ActiveUsers { get; set; }
    public UserDto TopPlayer { get; set; } = null!;
    public int TotalMatchesToday { get; set; }
    public int NewUsersThisMonth { get; set; }
}
