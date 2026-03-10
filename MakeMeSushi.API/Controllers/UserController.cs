using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using  Microsoft.EntityFrameworkCore;  
using MakeMeSushi.API.Data;
using MakeMeSushi.API.Models;


[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("complete-focus/{sushiID}")]
    [Authorize]
    public async Task<ActionResult<int>> CompleteFocus(int sushiID)
    {
       var username = User.Identity?.Name;
       var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
       var sushi = await _context.Sushis.FindAsync(sushiID);

         if (user == null) return NotFound("User not found");
         if (sushi == null) return NotFound("Sushi not found");


         user.TotalCoins += sushi.CoinReward;

         var completion = new CompletedSushi
         {
             UserId = user.Id,
             SushiID = sushiID,
             DateCompleted = DateTime.Now
         };

         _context.CompletedSushis.Add(completion);
         await _context.SaveChangesAsync();

         return Ok(new
         {
             NewBalance = user.TotalCoins,
             AddedCoins = sushi.CoinReward,
             Message = "Focus session completed! Coins added: " + sushi.CoinReward
         });
    }

    [HttpGet("stats")]
    [Authorize]
    public async Task<ActionResult> GetUserStats()
    {
        var username = User.Identity?.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null) return NotFound();

        var today = DateTime.Today;
        var lastWeek = today.AddDays(-7);

        var dailyCount = await _context.CompletedSushis.CountAsync(cs => cs.UserId == user.Id && cs.DateCompleted >= today);

        var weeklyCount = await _context.CompletedSushis.CountAsync(cs => cs.UserId == user.Id && cs.DateCompleted >= lastWeek);

        var totalCount = await _context.CompletedSushis.CountAsync(cs => cs.UserId == user.Id);

        return Ok(new
        {
            DailyTotal = dailyCount,
            WeeklyTotal = weeklyCount,
            AllTimeTotal = totalCount,
            CurrentCoins = user.TotalCoins
        });
    }

}