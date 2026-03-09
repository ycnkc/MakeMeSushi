namespace MakeMeSushi.Models
{
    public class PomodoroSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime StartTime { get; set; } = DateTime.Now;
        public DateTime? EndTime { get; set; }

        public bool IsCompleted { get; set; }
        public bool FocusModeActive { get; set; }

        public bool EarnedCoins { get; set; }

        public User User {get; set;} = null!; 
 
    }
}
