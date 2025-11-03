using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicTacToe.Data;
using TicTacToe.Models;

namespace TicTacToe.Controllers;

[ApiController]
[Route("api/game")]
[Authorize]
public class GameController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public GameController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost("submit-score")]
    public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        // Update user stats
        switch (request.Result.ToLower())
        {
            case "win":
                user.Wins++;
                break;
            case "loss":
                user.Losses++;
                break;
            case "draw":
                user.Draws++;
                break;
            default:
                return BadRequest(new { message = "Invalid result type" });
        }

        await _userManager.UpdateAsync(user);

        // Save game record
        var gameScore = new GameScore
        {
            UserId = userId,
            GameMode = request.GameMode,
            Result = request.Result
        };

        _context.GameScores.Add(gameScore);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Score submitted successfully" });
    }

    [HttpGet("scores")]
    public async Task<IActionResult> GetScores()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var response = new
        {
            wins = user.Wins,
            losses = user.Losses,
            draws = user.Draws,
            totalGames = user.Wins + user.Losses + user.Draws
        };

        return Ok(response);
    }
}


