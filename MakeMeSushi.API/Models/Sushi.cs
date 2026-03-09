namespace MakeMeSushi.API.Models
{
    public class Sushi
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public int RequiredFocusTime { get; set; }
        public int CoinReward { get; set; }

        public string ImagePath { get; set; } = string.Empty;
    }
}