using Application.DTOs;

namespace Application.Interfaces
{
    public interface IUserService
    {
        public Task<UserDto?> AuthenticateUser(string username, string password);
        public Task<UserDto?> RegisterUser(UserDto register);
    }
}
