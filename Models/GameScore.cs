namespace TicTacToe.Models;

public class GameScore
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string GameMode { get; set; } = string.Empty; // "SinglePlayer" or "TwoPlayer"
    public string Result { get; set; } = string.Empty; // "Win", "Loss", "Draw"
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ApplicationUser? User { get; set; }
}


