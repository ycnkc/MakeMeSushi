using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using  Microsoft.EntityFrameworkCore;  
using MakeMeSushi.API.Data;  

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("add-coins")]
    [Authorize]
    public async Task<ActionResult<int>> AddCoins(int amount)
    {
       var nameClaim = User.FindFirst(ClaimTypes.Name)?.Value;

       if (string.IsNullOrEmpty(nameClaim))
       {
           return Unauthorized();
       }

       var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == nameClaim);

         if (user == null)
         {
              return NotFound();
         }

         user.TotalCoins += amount;

         await _context.SaveChangesAsync();
         return Ok(user.Username + "now has " + user.TotalCoins + " coins.");
    }
}