using System.ComponentModel.DataAnnotations;

namespace TicTacToe.Models;

public class SubmitScoreRequest
{
    [Required]
    public string GameMode { get; set; } = string.Empty;

    [Required]
    public string Result { get; set; } = string.Empty; // "Win", "Loss", "Draw"
}


