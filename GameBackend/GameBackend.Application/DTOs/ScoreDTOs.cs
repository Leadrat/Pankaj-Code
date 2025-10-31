namespace GameBackend.Application.DTOs;

public class ScoreDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int Draws { get; set; }
    public int TotalScore { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateScoreDto
{
    public int UserId { get; set; }
    public bool IsWin { get; set; }
    public bool IsDraw { get; set; }
    public int ScorePoints { get; set; }
}

public class LeaderboardDto
{
    public List<ScoreDto> Scores { get; set; } = new();
    public int TotalPlayers { get; set; }
}
