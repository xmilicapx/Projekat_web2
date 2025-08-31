using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class Quiz
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } = 0;
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public int Time { get; set; } = 0;
        public string Difficulty { get; set; } = "Easy";

        [Column(TypeName = "json")]
        public string Questions { get; set; } = "";

        [Column(TypeName = "json")]
        public string Answers { get; set; } = "";

        public Quiz() { }

        public Quiz(int id, string name, string description, string category, int time, string difficulty, string questions, string answers)
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
