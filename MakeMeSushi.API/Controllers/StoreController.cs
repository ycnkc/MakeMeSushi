using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MakeMeSushi.API.Data;
using MakeMeSushi.API.Models;

namespace MakeMeSushi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Sadece giriş yapmış kullanıcılar mağazayı görebilir ve alışveriş yapabilir
    public class StoreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StoreController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. MAĞAZADAKİ SUSHİLERİ LİSTELE ---
        [HttpGet("sushis")]
        public async Task<ActionResult> GetStoreSushis()
        {
            var username = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            // Tüm sushileri ve kullanıcının sahip olduğu sushileri çekiyoruz
            var allSushis = await _context.Sushis.ToListAsync();
            var userOwnedSushiIds = await _context.UserUnlockedSushis
                                                  .Where(u => u.UserId == user.Id)
                                                  .Select(u => u.SushiId)
                                                  .ToListAsync();

            // React'e gönderirken "Bu sushi kilitli mi?" (IsLocked) bilgisini de ekliyoruz
            var storeCatalog = allSushis.Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.CoinReward,
                s.RequiredFocusTime,
                s.ImagePath,
                s.UnlockPrice,
                // Eğer fiyatı 0 ise VEYA kullanıcı zaten satın almışsa kilit açık sayılır
                IsUnlocked = s.UnlockPrice == 0 || userOwnedSushiIds.Contains(s.Id)
            });

            return Ok(storeCatalog);
        }

        // --- 2. SUSHİ SATIN ALMA ---
        [HttpPost("buy-sushi/{sushiId}")]
        public async Task<ActionResult> BuySushi(int sushiId)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var sushi = await _context.Sushis.FindAsync(sushiId);
            if (sushi == null) return NotFound("Böyle bir sushi yok.");

            // Kontrol 1: Sushi zaten bedava mı?
            if (sushi.UnlockPrice == 0) return BadRequest("Bu sushi zaten ücretsiz!");

            // Kontrol 2: Kullanıcı bunu zaten almış mı?
            var alreadyOwned = await _context.UserUnlockedSushis
                                             .AnyAsync(u => u.UserId == user.Id && u.SushiId == sushiId);
            if (alreadyOwned) return BadRequest("Bu sushiyi zaten satın aldınız.");

            // Kontrol 3: Bakiye yeterli mi?
            if (user.TotalCoins < sushi.UnlockPrice) return BadRequest("Yetersiz bakiye!");

            // Satın Alma İşlemi
            user.TotalCoins -= sushi.UnlockPrice; // Parayı düş
            
            var newUnlock = new UserUnlockedSushi
            {
                UserId = user.Id,
                SushiId = sushiId,
                UnlockedAt = DateTime.Now
            };
            _context.UserUnlockedSushis.Add(newUnlock); // Envantere ekle

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"{sushi.Name} tarifi başarıyla açıldı!",
                NewBalance = user.TotalCoins
            });
        }

        // --- 3. DEKORASYON SATIN ALMA (İlerisi için hazırlık) ---
        [HttpPost("buy-decoration/{decorationId}")]
        public async Task<ActionResult> BuyDecoration(int decorationId)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            
            var decoration = await _context.Decorations.FindAsync(decorationId);
            if (decoration == null || user == null) return NotFound();

            var alreadyOwned = await _context.UserDecorations
                                             .AnyAsync(u => u.UserId == user.Id && u.DecorationId == decorationId);
            if (alreadyOwned) return BadRequest("Bu eşyaya zaten sahipsiniz.");

            if (user.TotalCoins < decoration.Price) return BadRequest("Yetersiz bakiye!");

            // Parayı düş ve envantere ekle
            user.TotalCoins -= decoration.Price;
            _context.UserDecorations.Add(new UserDecoration 
            { 
                UserId = user.Id, 
                DecorationId = decorationId,
                IsEquipped = false // Satın alınınca otomatik kullanıma geçmesin, oyuncu kendi seçsin
            });

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Dekorasyon satın alındı!", NewBalance = user.TotalCoins });
        }

        [HttpGet]
    public async Task<ActionResult<IEnumerable<Decoration>>> GetDecorations()
    {
        // Veritabanındaki Decorations tablosundan verileri çek
        return await _context.Decorations.ToListAsync();
    }

    [HttpPost("toggle-decoration/{decorationId}")]
public async Task<ActionResult> ToggleDecoration(int decorationId)
{
    var username = User.Identity?.Name;
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    
    // Kullanıcının bu dekorasyona sahip olup olmadığını kontrol et
    var userDecor = await _context.UserDecorations
        .FirstOrDefaultAsync(u => u.UserId == user.Id && u.DecorationId == decorationId);
    
    if (userDecor == null) return BadRequest("Bu eşyaya sahip değilsiniz.");

    // Durumu tersine çevir
    userDecor.IsEquipped = !userDecor.IsEquipped;
    
    await _context.SaveChangesAsync();

    return Ok(new { IsEquipped = userDecor.IsEquipped });
}
    }

    
}