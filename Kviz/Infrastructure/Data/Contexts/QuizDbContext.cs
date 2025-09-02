using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Contexts
{
    public class QuizDbContext(DbContextOptions<QuizDbContext> options) : DbContext(options)
    {
        public DbSet<Quiz> Quizzes { get; set; }
    }
}
