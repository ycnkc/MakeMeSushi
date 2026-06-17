using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using  Microsoft.EntityFrameworkCore;  
using MakeMeSushi.API.Data;
using MakeMeSushi.API.Models;
using System.Globalization;


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

    // 1. CompletedSushis tablosuna kayıt at
    var completion = new CompletedSushi
    {
        UserId = user.Id,
        SushiID = sushiID,
        SushiName = sushi.Name,
        DateCompleted = DateTime.Now
    };
    _context.CompletedSushis.Add(completion);

    // 2. PomodoroSessions tablosuna kayıt at
    // Not: Session'ı buraya eklersen, her tamamlanan sushi aynı zamanda 1 pomodoro oturumu sayılır.
    var session = new PomodoroSession
    {
        UserId = user.Id,
        StartTime = DateTime.Now.AddMinutes(-25), // 25 dk önce başladı varsayıyoruz
        EndTime = DateTime.Now,
        IsCompleted = true,
        FocusModeActive = true,
        EarnedCoins = sushi.CoinReward
    };
    _context.PomodoroSessions.Add(session);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        NewBalance = user.TotalCoins,
        Message = "Focus session and Sushi completed!"
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
        var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
        var sevenDaysAgo = today.AddDays(-6);

        // Her bir sushi yapımının 25 dakika (1 Pomodoro) olduğunu varsayıyoruz
        int minutesPerPomodoro = 25; 

        // 1. ÖZET RAKAMLAR (Bugün, Bu Ay, Tüm Zamanlar)
        var dailyCount = await _context.CompletedSushis
            .CountAsync(cs => cs.UserId == user.Id && cs.DateCompleted.Date == today);
        
        var monthlyCount = await _context.CompletedSushis
            .CountAsync(cs => cs.UserId == user.Id && cs.DateCompleted.Date >= firstDayOfMonth);
        
        var totalCount = await _context.CompletedSushis
            .CountAsync(cs => cs.UserId == user.Id);

        // 2. HAFTALIK GRAFİK (Son 7 Gün)
        // Veritabanından son 7 günün verisini gün bazında gruplayarak çekiyoruz
        var weeklyDataDb = await _context.CompletedSushis
            .Where(cs => cs.UserId == user.Id && cs.DateCompleted.Date >= sevenDaysAgo)
            .GroupBy(cs => cs.DateCompleted.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var weeklyChart = new List<object>();
        
        // Grafikte boş günlerin (hiç çalışılmayan günlerin) de 0 olarak görünmesi için döngü kuruyoruz
        for (int i = 6; i >= 0; i--)
        {
            var currentDate = today.AddDays(-i);
            var dayData = weeklyDataDb.FirstOrDefault(d => d.Date == currentDate);
            
            weeklyChart.Add(new
            {
                day = currentDate.ToString("ddd", CultureInfo.InvariantCulture), // "Mon", "Tue" gibi kısa gün adları
                minutes = (dayData?.Count ?? 0) * minutesPerPomodoro
            });
        }

        // 3. BUGÜN YAPILAN SUSHİLER (GÜNLÜK LOG)
        // CompletedSushis ve Sushis tablolarını birleştirip (Join), görselleriyle beraber sayısını alıyoruz
        var todaySushis = await _context.CompletedSushis
            .Where(cs => cs.UserId == user.Id && cs.DateCompleted.Date == today)
            .Join(_context.Sushis, 
                  cs => cs.SushiID, 
                  s => s.Id, 
                  (cs, s) => new { cs.SushiName, s.ImagePath }) // İki tablodan lazım olanları aldık
            .GroupBy(x => new { x.SushiName, x.ImagePath }) // İsme ve resme göre grupladık
            .Select(g => new
            {
                name = g.Key.SushiName,
                imagePath = g.Key.ImagePath,
                count = g.Count()
            })
            .ToListAsync();

        // FRONTEND'İN BEKLEDİĞİ EKSİKSİZ JSON YAPISI
        return Ok(new
        {
            todayMinutes = dailyCount * minutesPerPomodoro,
            monthMinutes = monthlyCount * minutesPerPomodoro,
            totalMinutes = totalCount * minutesPerPomodoro,
            weeklyChart = weeklyChart,
            todaySushis = todaySushis,
            currentCoins = user.TotalCoins // Eğer menünün başka bir yerinde lazımsa diye parayı da gönderiyoruz
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

[HttpPost("add-reward-coins")]
    [Authorize]
    public async Task<ActionResult<object>> AddRewardCoins([FromBody] RewardRequest request)
    {
        var username = User.Identity?.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null) return NotFound("User not found");

        // Görevden gelen ödülü kullanıcının toplam parasına ekle
        user.TotalCoins += request.RewardAmount;
        
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Quest reward added successfully!",
            newBalance = user.TotalCoins
        });
    }
    

}

public class RewardRequest
{
    public int RewardAmount { get; set; }
}