using Microsoft.AspNetCore.Identity;

namespace TicTacToe.Models;

public class ApplicationUser : IdentityUser
{
    public int Wins { get; set; } = 0;
    public int Losses { get; set; } = 0;
    public int Draws { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


