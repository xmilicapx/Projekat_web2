using Application.DTOs;
using Application.Interfaces;
using Application.Utilities;
using AutoMapper;
using Infrastructure.Interfaces;
using Infrastructure.Models;

namespace Application.Services
{
    public class UserService(IUserRepository repository, IMapper map) : IUserService
    {
        IUserRepository repo = repository;
        IMapper mapper = map;

        public async Task<UserDto?> AuthenticateUser(string username, string password)
        {
            try
            {
                User? user = await repo.GetByUsernameAsync(username);

                if (user != null && BCryptUtility.Verify(password, user.Password) == true)
                    return mapper.Map<User, UserDto>(user);
                else
                    return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<UserDto?> RegisterUser(UserDto register)
        {
            try
            {
                User user = mapper.Map<UserDto, User>(register);
                user.Password = BCryptUtility.Hash(register.Password);

                User? saved = await repo.AddAsync(user);

                if (saved != null)
                    return mapper.Map<User, UserDto>(saved);
                else
                    return null;
            }
            catch
            {
                return null;
            }
        }
    }
}
