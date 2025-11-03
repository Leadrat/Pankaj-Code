using System.ComponentModel.DataAnnotations;

namespace TicTacToe.Models;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string UserName { get; set; } = string.Empty;
}


