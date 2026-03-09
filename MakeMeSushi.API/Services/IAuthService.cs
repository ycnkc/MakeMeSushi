using MakeMeSushi.Models;

namespace MakeMeSushi.Services
{
    public interface IAuthService
    {
        string CreateToken(User user);
    }
}
