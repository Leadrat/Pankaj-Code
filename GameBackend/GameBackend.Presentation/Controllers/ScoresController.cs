using GameBackend.Application.DTOs;
using GameBackend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GameBackend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User,Admin")]
public class ScoresController : ControllerBase
{
    private readonly IScoreService _scoreService;
    private readonly ILogger<ScoresController> _logger;

    public ScoresController(IScoreService scoreService, ILogger<ScoresController> logger)
    {
        _scoreService = scoreService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<LeaderboardDto>> GetLeaderboard([FromQuery] int limit = 10)
    {
        try
        {
            var result = await _scoreService.GetLeaderboardAsync(limit);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leaderboard");
            return StatusCode(500, new { message = "An error occurred while fetching leaderboard" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ScoreDto>> GetUserScore(int userId)
    {
        try
        {
            var result = await _scoreService.GetUserScoreAsync(userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user score");
            return StatusCode(500, new { message = "An error occurred while fetching user score" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ScoreDto>> SubmitScore([FromBody] CreateScoreDto createScoreDto)
    {
        try
        {
            var result = await _scoreService.CreateScoreAsync(createScoreDto);
            return CreatedAtAction(nameof(GetUserScore), new { userId = result.UserId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting score");
            return StatusCode(500, new { message = "An error occurred while submitting score" });
        }
    }
}
