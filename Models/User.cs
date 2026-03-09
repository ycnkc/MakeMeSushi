namespace MakeMeSushi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int TotalCoins { get; set; } = 0;
        public string Role { get; set; } = "User";

    }
}
