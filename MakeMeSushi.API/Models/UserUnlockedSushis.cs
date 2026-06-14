namespace MakeMeSushi.API.Models
{
    public class UserUnlockedSushi
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SushiId { get; set; }
        public DateTime UnlockedAt { get; set; } = DateTime.Now;
    }
}