using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicTacToe.Data;
using TicTacToe.Models;

namespace TicTacToe.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("players")]
    public async Task<IActionResult> GetAllPlayers()
    {
        var users = await _userManager.Users.ToListAsync();
        
        var playerStats = users.Select(user => new PlayerStatsResponse
        {
            UserId = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            Wins = user.Wins,
            Losses = user.Losses,
            Draws = user.Draws,
            CreatedAt = user.CreatedAt
        }).OrderByDescending(p => p.Wins)
          .ToList();

        return Ok(playerStats);
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var totalPlayers = await _userManager.Users.CountAsync();
        var totalGames = await _context.GameScores.CountAsync();
        
        var topPlayers = await _userManager.Users
            .OrderByDescending(u => u.Wins)
            .Take(5)
            .Select(u => new
            {
                userName = u.UserName,
                wins = u.Wins,
                losses = u.Losses,
                draws = u.Draws
            })
            .ToListAsync();

        return Ok(new
        {
            totalPlayers,
            totalGames,
            topPlayers
        });
    }
}


