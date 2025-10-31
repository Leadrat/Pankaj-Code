using GameBackend.Application.DTOs;
using GameBackend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GameBackend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            var result = await _adminService.GetAllUsersAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new { message = "An error occurred while fetching users" });
        }
    }

    [HttpGet("scores")]
    public async Task<ActionResult<IEnumerable<ScoreDto>>> GetAllScores()
    {
        try
        {
            var result = await _adminService.GetAllScoresAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all scores");
            return StatusCode(500, new { message = "An error occurred while fetching scores" });
        }
    }

    [HttpDelete("user/{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        try
        {
            var result = await _adminService.DeleteUserAsync(id);
            if (result)
            {
                return Ok(new { message = "User deleted successfully" });
            }
            return NotFound(new { message = "User not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, new { message = "An error occurred while deleting user" });
        }
    }

    [HttpPut("reset-scores")]
    public async Task<ActionResult> ResetAllScores()
    {
        try
        {
            var result = await _adminService.ResetAllScoresAsync();
            if (result)
            {
                return Ok(new { message = "All scores reset successfully" });
            }
            return BadRequest(new { message = "Failed to reset scores" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting scores");
            return StatusCode(500, new { message = "An error occurred while resetting scores" });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<AdminSummaryDto>> GetSummary()
    {
        try
        {
            var result = await _adminService.GetSummaryAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting admin summary");
            return StatusCode(500, new { message = "An error occurred while fetching summary" });
        }
    }
}
