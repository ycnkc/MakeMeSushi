using MakeMeSushi.API.Models;

namespace MakeMeSushi.API.Services
{
    public interface IAuthService
    {
        string CreateToken(User user);
    }
}
