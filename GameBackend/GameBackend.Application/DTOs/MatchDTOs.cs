using GameBackend.Domain.Entities;

namespace GameBackend.Application.DTOs;

public class MatchDto
{
    public int Id { get; set; }
    public int Player1Id { get; set; }
    public string Player1Username { get; set; } = string.Empty;
    public int Player2Id { get; set; }
    public string Player2Username { get; set; } = string.Empty;
    public int Player1Score { get; set; }
    public int Player2Score { get; set; }
    public MatchResult Result { get; set; }
    public Domain.Entities.MatchType GameMode { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public bool IsCompleted { get; set; }
}

public class CreateMatchDto
{
    public int Player2Id { get; set; }
    public Domain.Entities.MatchType GameMode { get; set; }
}

public class UpdateMatchDto
{
    public int Player1Score { get; set; }
    public int Player2Score { get; set; }
    public MatchResult Result { get; set; }
}
