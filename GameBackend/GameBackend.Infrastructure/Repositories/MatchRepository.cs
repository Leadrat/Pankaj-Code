using GameBackend.Domain.Entities;
using GameBackend.Domain.Interfaces;
using GameBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameBackend.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;

    public MatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Match?> GetByIdAsync(int id)
    {
        return await _context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Match>> GetByUserIdAsync(int userId)
    {
        return await _context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .Where(m => m.Player1Id == userId || m.Player2Id == userId)
            .OrderByDescending(m => m.StartedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetAllAsync()
    {
        return await _context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .OrderByDescending(m => m.StartedAt)
            .ToListAsync();
    }

    public async Task<Match> CreateAsync(Match match)
    {
        _context.Matches.Add(match);
        await _context.SaveChangesAsync();
        return match;
    }

    public async Task<Match> UpdateAsync(Match match)
    {
        _context.Matches.Update(match);
        await _context.SaveChangesAsync();
        return match;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var match = await _context.Matches.FindAsync(id);
        if (match == null) return false;

        _context.Matches.Remove(match);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetTotalMatchesCountAsync()
    {
        return await _context.Matches.CountAsync();
    }

    public async Task<int> GetUserMatchesCountAsync(int userId)
    {
        return await _context.Matches
            .CountAsync(m => m.Player1Id == userId || m.Player2Id == userId);
    }
}
