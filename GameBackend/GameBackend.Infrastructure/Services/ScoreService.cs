using GameBackend.Application.DTOs;
using GameBackend.Application.Services;
using GameBackend.Domain.Interfaces;

namespace GameBackend.Infrastructure.Services;

public class ScoreService : IScoreService
{
    private readonly IScoreRepository _scoreRepository;
    private readonly IUserRepository _userRepository;

    public ScoreService(IScoreRepository scoreRepository, IUserRepository userRepository)
    {
        _scoreRepository = scoreRepository;
        _userRepository = userRepository;
    }

    public async Task<LeaderboardDto> GetLeaderboardAsync(int limit = 10)
    {
        var scores = await _scoreRepository.GetLeaderboardAsync(limit);
        var scoreDtos = scores.Select(s => new ScoreDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Username = s.User.Username,
            Wins = s.Wins,
            Losses = s.Losses,
            Draws = s.Draws,
            TotalScore = s.TotalScore,
            CreatedAt = s.CreatedAt
        }).ToList();

        return new LeaderboardDto
        {
            Scores = scoreDtos,
            TotalPlayers = scoreDtos.Count
        };
    }

    public async Task<ScoreDto> GetUserScoreAsync(int userId)
    {
        var score = await _scoreRepository.GetByUserIdAsync(userId);
        if (score == null)
        {
            throw new KeyNotFoundException("Score not found for user");
        }

        return new ScoreDto
        {
            Id = score.Id,
            UserId = score.UserId,
            Username = score.User.Username,
            Wins = score.Wins,
            Losses = score.Losses,
            Draws = score.Draws,
            TotalScore = score.TotalScore,
            CreatedAt = score.CreatedAt
        };
    }

    public async Task<ScoreDto> CreateScoreAsync(CreateScoreDto createScoreDto)
    {
        var user = await _userRepository.GetByIdAsync(createScoreDto.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var existingScore = await _scoreRepository.GetByUserIdAsync(createScoreDto.UserId);
        if (existingScore != null)
        {
            throw new InvalidOperationException("Score already exists for user");
        }

        var score = new Domain.Entities.Score
        {
            UserId = createScoreDto.UserId,
            Wins = createScoreDto.IsWin ? 1 : 0,
            Losses = (!createScoreDto.IsWin && !createScoreDto.IsDraw) ? 1 : 0,
            Draws = createScoreDto.IsDraw ? 1 : 0,
            TotalScore = createScoreDto.ScorePoints,
            CreatedAt = DateTime.UtcNow
        };

        var createdScore = await _scoreRepository.CreateAsync(score);

        return new ScoreDto
        {
            Id = createdScore.Id,
            UserId = createdScore.UserId,
            Username = createdScore.User.Username,
            Wins = createdScore.Wins,
            Losses = createdScore.Losses,
            Draws = createdScore.Draws,
            TotalScore = createdScore.TotalScore,
            CreatedAt = createdScore.CreatedAt
        };
    }

    public async Task<ScoreDto> UpdateScoreAsync(int userId, bool isWin, bool isDraw, int scorePoints)
    {
        var score = await _scoreRepository.GetByUserIdAsync(userId);
        if (score == null)
        {
            throw new KeyNotFoundException("Score not found for user");
        }

        if (isWin)
        {
            score.Wins++;
        }
        else if (isDraw)
        {
            score.Draws++;
        }
        else
        {
            score.Losses++;
        }

        score.TotalScore += scorePoints;
        score.UpdatedAt = DateTime.UtcNow;

        var updatedScore = await _scoreRepository.UpdateAsync(score);

        return new ScoreDto
        {
            Id = updatedScore.Id,
            UserId = updatedScore.UserId,
            Username = updatedScore.User.Username,
            Wins = updatedScore.Wins,
            Losses = updatedScore.Losses,
            Draws = updatedScore.Draws,
            TotalScore = updatedScore.TotalScore,
            CreatedAt = updatedScore.CreatedAt
        };
    }

    public async Task<bool> ResetAllScoresAsync()
    {
        return await _scoreRepository.ResetAllScoresAsync();
    }
}
