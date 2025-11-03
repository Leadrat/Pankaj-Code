using GameBackend.Domain.Entities;
using GameBackend.Domain.Interfaces;
using GameBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameBackend.Infrastructure.Repositories;

public class ScoreRepository : IScoreRepository
{
    private readonly ApplicationDbContext _context;

    public ScoreRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Score?> GetByIdAsync(int id)
    {
        return await _context.Scores
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Score?> GetByUserIdAsync(int userId)
    {
        return await _context.Scores
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<IEnumerable<Score>> GetLeaderboardAsync(int limit = 10)
    {
        return await _context.Scores
            .Include(s => s.User)
            .OrderByDescending(s => s.TotalScore)
            .ThenByDescending(s => s.Wins)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IEnumerable<Score>> GetAllAsync()
    {
        return await _context.Scores
            .Include(s => s.User)
            .ToListAsync();
    }

    public async Task<Score> CreateAsync(Score score)
    {
        _context.Scores.Add(score);
        await _context.SaveChangesAsync();
        return score;
    }

    public async Task<Score> UpdateAsync(Score score)
    {
        score.UpdatedAt = DateTime.UtcNow;
        _context.Scores.Update(score);
        await _context.SaveChangesAsync();
        return score;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var score = await _context.Scores.FindAsync(id);
        if (score == null) return false;

        _context.Scores.Remove(score);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetAllScoresAsync()
    {
        var scores = await _context.Scores.ToListAsync();
        foreach (var score in scores)
        {
            score.Wins = 0;
            score.Losses = 0;
            score.Draws = 0;
            score.TotalScore = 0;
            score.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
