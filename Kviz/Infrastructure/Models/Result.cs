using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class Result
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } = 0;
        public string QuizName { get; set; } = "";
        public string Username { get; set; } = "";

        [Column(TypeName = "json")]
        public string Questions { get; set; } = "";

        [Column(TypeName = "json")]
        public string Answers { get; set; } = "";

        public DateTime QuizDone { get; set; } = DateTime.Now;

        public Result() { }

        public Result(int id, string quizName, string username, string questions, string answers, DateTime quizDone)
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
