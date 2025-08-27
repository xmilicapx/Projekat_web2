using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [Route("api/v1/quiz")]
    [ApiController]
    public class QuizServiceController(IQuizService quizService) : ControllerBase
    {
        IQuizService _quizService = quizService;

        [Authorize(Roles = "user,admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            try
            {
                var quizzes = await _quizService.GetAllQuizzes();
                return Ok(quizzes);
            }
            catch
            {
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddQuiz(QuizDto newQuiz)
        {
            try
            {
                bool success = await _quizService.AddQuiz(newQuiz);
                return success ? Ok() : BadRequest();
            }
            catch
            {
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuiz(QuizDto updatedQuiz)
        {
            try
            {
                bool success = await _quizService.UpdateQuiz(updatedQuiz);
                return success ? Ok() : BadRequest();
            }
            catch
            {
                return BadRequest();
            }
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            try
            {
                bool success = await _quizService.RemoveQuiz(id);
                return success ? Ok() : BadRequest();
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
