namespace GameBackend.Domain.Entities;

public class Match
{
    public int Id { get; set; }
    public int Player1Id { get; set; }
    public int Player2Id { get; set; }
    public int Player1Score { get; set; }
    public int Player2Score { get; set; }
    public MatchResult Result { get; set; }
    public MatchType GameMode { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public bool IsCompleted { get; set; } = false;
    
    // Navigation properties
    public User Player1 { get; set; } = null!;
    public User Player2 { get; set; } = null!;
}

public enum MatchResult
{
    Player1Win,
    Player2Win,
    Draw,
    Ongoing
}

public enum MatchType
{
    SinglePlayer,
    TwoPlayer
}
