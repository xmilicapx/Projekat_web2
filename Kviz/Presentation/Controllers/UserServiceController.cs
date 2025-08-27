using Application.DTOs;
using Application.Interfaces;
using Application.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [Route("api/v1/user")]
    [ApiController]
    public class UserServiceController(IUserService userService, IJwtTokenUtility jwtTokenUtility) : ControllerBase
    {
        IUserService user_service = userService;
        IJwtTokenUtility jwt = jwtTokenUtility;

        [HttpPost("auth")]
        public async Task<IActionResult> AuthenticateUser(LoginDto login)
        {
            try
            {
                UserDto? user = await user_service.AuthenticateUser(login.Username, login.Password);

                if (user == null)
                    return BadRequest();
                else
                    return Ok(jwt.GenerateToken(user.Id, user.Username, user.Role));
            }
            catch
            {
                return BadRequest();
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser(UserDto register)
        {
            try
            {
                UserDto? user = await user_service.RegisterUser(register);

                if (user == null)
                    return BadRequest();
                else
                    return Ok(jwt.GenerateToken(user.Id, user.Username, user.Role));
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
