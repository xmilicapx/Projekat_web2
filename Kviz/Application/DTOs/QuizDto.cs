using System.ComponentModel.DataAnnotations.Schema;

namespace Application.DTOs
{
    public class QuizDto
    {
        public int Id { get; set; } = 0;
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public int Time { get; set; } = 0;
        public string Difficulty { get; set; } = "Easy";
        public string Questions { get; set; } = "";
        public string Answers { get; set; } = "";

        public QuizDto() { }

        public QuizDto(int id, string name, string description, string category, int time, string difficulty, string questions, string answers)
        {
            Id = id;
            Name = name;
            Description = description;
            Category = category;
            Time = time;
            Difficulty = difficulty;
            Questions = questions;
            Answers = answers;
        }
    }
}
