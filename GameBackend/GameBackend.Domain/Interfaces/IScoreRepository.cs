using GameBackend.Domain.Entities;

namespace GameBackend.Domain.Interfaces;

public interface IScoreRepository
{
    Task<Score?> GetByIdAsync(int id);
    Task<Score?> GetByUserIdAsync(int userId);
    Task<IEnumerable<Score>> GetLeaderboardAsync(int limit = 10);
    Task<IEnumerable<Score>> GetAllAsync();
    Task<Score> CreateAsync(Score score);
    Task<Score> UpdateAsync(Score score);
    Task<bool> DeleteAsync(int id);
    Task<bool> ResetAllScoresAsync();
}
