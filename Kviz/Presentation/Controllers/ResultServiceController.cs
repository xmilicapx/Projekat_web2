using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [Route("api/v1/results")]
    [ApiController]
    public class ResultServiceController(IResultService resultService) : ControllerBase
    {
        IResultService _resultService = resultService;

        [Authorize(Roles = "user")]
        [HttpPost("add")]
        public async Task<IActionResult> AddResult(ResultDto result)
        {
            try
            {
                if (result == null)
                    return BadRequest();

                bool success = await _resultService.AddResult(result);
                return success ? Ok() : BadRequest();
            }
            catch
            {
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin,user")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllResults()
        {
            try
            {
                var results = await _resultService.GetAllResults();
                return Ok(results);
            }
            catch
            {
                return BadRequest();
            }
        }

        [Authorize(Roles = "user")]
        [HttpGet("user/{username}")]
        public async Task<IActionResult> GetUserResults(string username)
        {
            try
            {
                var results = await _resultService.GetAllUserResultsByUsername(username);
                return Ok(results);
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}