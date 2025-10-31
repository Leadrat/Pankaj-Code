using GameBackend.Application.DTOs;
using GameBackend.Application.Services;
using GameBackend.Domain.Interfaces;

namespace GameBackend.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IScoreRepository _scoreRepository;
    private readonly IMatchRepository _matchRepository;

    public AdminService(
        IUserRepository userRepository,
        IScoreRepository scoreRepository,
        IMatchRepository matchRepository)
    {
        _userRepository = userRepository;
        _scoreRepository = scoreRepository;
        _matchRepository = matchRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            CreatedAt = u.CreatedAt,
            IsActive = u.IsActive
        });
    }

    public async Task<IEnumerable<ScoreDto>> GetAllScoresAsync()
    {
        var scores = await _scoreRepository.GetAllAsync();
        return scores.Select(s => new ScoreDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Username = s.User.Username,
            Wins = s.Wins,
            Losses = s.Losses,
            Draws = s.Draws,
            TotalScore = s.TotalScore,
            CreatedAt = s.CreatedAt
        });
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        return await _userRepository.DeleteAsync(userId);
    }

    public async Task<bool> ResetAllScoresAsync()
    {
        return await _scoreRepository.ResetAllScoresAsync();
    }

    public async Task<AdminSummaryDto> GetSummaryAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var scores = await _scoreRepository.GetAllAsync();
        var totalMatches = await _matchRepository.GetTotalMatchesCountAsync();

        var activeUsers = users.Count(u => u.IsActive);
        var topPlayer = scores.OrderByDescending(s => s.TotalScore).FirstOrDefault();
        var matchesToday = await _matchRepository.GetAllAsync();
        var matchesTodayCount = matchesToday.Count(m => m.StartedAt.Date == DateTime.Today);
        var newUsersThisMonth = users.Count(u => u.CreatedAt.Month == DateTime.Now.Month && u.CreatedAt.Year == DateTime.Now.Year);

        var topPlayerDto = topPlayer != null ? new UserDto
        {
            Id = topPlayer.User.Id,
            Username = topPlayer.User.Username,
            Email = topPlayer.User.Email,
            Role = topPlayer.User.Role,
            CreatedAt = topPlayer.User.CreatedAt,
            IsActive = topPlayer.User.IsActive
        } : new UserDto();

        return new AdminSummaryDto
        {
            TotalUsers = users.Count(),
            TotalMatches = totalMatches,
            ActiveUsers = activeUsers,
            TopPlayer = topPlayerDto,
            TotalMatchesToday = matchesTodayCount,
            NewUsersThisMonth = newUsersThisMonth
        };
    }
}
