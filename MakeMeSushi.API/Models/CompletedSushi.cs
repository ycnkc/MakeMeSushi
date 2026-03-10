namespace MakeMeSushi.API.Models
{
    public class CompletedSushi
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SushiID { get; set; }
        public DateTime DateCompleted { get; set; } = DateTime.Now;

        public User User { get; set; } = null!;
        public Sushi Sushi { get; set; } = null!;
    }
}