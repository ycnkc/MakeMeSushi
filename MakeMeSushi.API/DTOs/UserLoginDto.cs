namespace MakeMeSushi.API.DTOs
{
    public class UserLoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
