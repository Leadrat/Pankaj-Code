using GameBackend.Domain.Entities;

namespace GameBackend.Domain.Interfaces;

public interface IMatchRepository
{
    Task<Match?> GetByIdAsync(int id);
    Task<IEnumerable<Match>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Match>> GetAllAsync();
    Task<Match> CreateAsync(Match match);
    Task<Match> UpdateAsync(Match match);
    Task<bool> DeleteAsync(int id);
    Task<int> GetTotalMatchesCountAsync();
    Task<int> GetUserMatchesCountAsync(int userId);
}
