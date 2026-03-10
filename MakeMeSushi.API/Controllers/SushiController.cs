using MakeMeSushi.API.Models;
using Microsoft.EntityFrameworkCore;
using MakeMeSushi.API.Data;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SushiController : ControllerBase
{
    private readonly AppDbContext _context;

    public SushiController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sushi>>> GetSushis()
    {
        var Sushis = await _context.Sushis.ToListAsync();
        return Ok(Sushis);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Sushi>> GetSushi(int id)
    {
        var sushi = await _context.Sushis.FindAsync(id);
        if (sushi == null)
        {
            return NotFound();
        }
        return Ok(sushi);
    }
}