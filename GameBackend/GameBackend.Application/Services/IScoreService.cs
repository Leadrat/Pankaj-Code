using GameBackend.Application.DTOs;

namespace GameBackend.Application.Services;

public interface IScoreService
{
    Task<LeaderboardDto> GetLeaderboardAsync(int limit = 10);
    Task<ScoreDto> GetUserScoreAsync(int userId);
    Task<ScoreDto> CreateScoreAsync(CreateScoreDto createScoreDto);
    Task<ScoreDto> UpdateScoreAsync(int userId, bool isWin, bool isDraw, int scorePoints);
    Task<bool> ResetAllScoresAsync();
}
