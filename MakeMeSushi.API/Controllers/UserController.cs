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
             SushiName = sushi.Name,
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

    [HttpPost("buy-decoration/{decorationID}")]
    [Authorize]
    public async Task<ActionResult> BuyDecoration(int decorationID)
    {
        var username = User.Identity?.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        var decor = await _context.Decorations.FindAsync(decorationID);

        if (user == null) return NotFound("User not found");
        if (decor == null) return NotFound("Decoration not found");

        // Zaten satın alınmış mı kontrol et
        var alreadyOwned = await _context.UserDecorations
            .AnyAsync(ud => ud.UserId == user.Id && ud.DecorationId == decorationID);
        
        if (alreadyOwned) return BadRequest("Decoration already purchased.");

        // Yeterli para var mı?
        if (user.TotalCoins < decor.Price) return BadRequest("Not enough coins.");

        // İşlemleri gerçekleştir
        user.TotalCoins -= decor.Price;

        var userDecor = new UserDecoration
        {
            UserId = user.Id,
            DecorationId = decorationID,
            IsEquipped = true // Varsayılan olarak alınınca takılı olsun
        };

        _context.UserDecorations.Add(userDecor);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Decoration purchased!", NewBalance = user.TotalCoins });
    }

    [HttpGet("my-decorations")]
    [Authorize]
    public async Task<ActionResult> GetMyDecorations() 
    {
        var username = User.Identity?.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        
        if (user == null) return NotFound("User not found");

        var myDecors = await _context.UserDecorations
            .Where(ud => ud.UserId == user.Id)
            .Select(ud => new { 
                DecorationId = ud.DecorationId, 
                IsEquipped = ud.IsEquipped 
            })
            .ToListAsync();

        return Ok(myDecors); 
    }

    

}