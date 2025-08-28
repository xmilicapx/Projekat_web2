using System.ComponentModel.DataAnnotations.Schema;

namespace Application.DTOs
{
    public class ResultDto
    {
        public int Id { get; set; } = 0;
        public string QuizName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Questions { get; set; } = ""; 
        public string Answers { get; set; } = "";
        public DateTime QuizDone { get; set; } = DateTime.Now;

        public ResultDto() { }

        public ResultDto(int id, string quizName, string username, string questions, string answers, DateTime quizDone)
        {
            Id = id;
            QuizName = quizName;
            Username = username;
            Questions = questions;
            Answers = answers;
            QuizDone = quizDone;
        }
    }
}
