using Infrastructure.Data.Contexts;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class QuizRepository : IQuizRepository
    {
        private readonly QuizDbContext _context;
        private readonly DbSet<Quiz> _quizzes;

        public QuizRepository(QuizDbContext context)
        {
            _context = context;
            _quizzes = _context.Quizzes;
        }

        public async Task<IEnumerable<Quiz>> GetAllAsync()
        {
            try
            {
                return await _quizzes.AsNoTracking().ToListAsync();
            }
            catch
            {
                return new List<Quiz>();
            }
        }

        public async Task<Quiz?> GetByIdAsync(int id)
        {
            try
            {
                return await _quizzes.AsNoTracking().FirstOrDefaultAsync(q => q.Id == id);
            }
            catch
            {
                return null;
            }
        }

        public async Task<Quiz?> AddAsync(Quiz quiz)
        {
            try
            {
                await _quizzes.AddAsync(quiz);
                await _context.SaveChangesAsync();
                return quiz;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Quiz?> UpdateAsync(Quiz quiz)
        {
            try
            {
                _quizzes.Update(quiz);
                await _context.SaveChangesAsync();
                return quiz;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var quiz = await _quizzes.FindAsync(id);
                if (quiz == null) return false;

                _quizzes.Remove(quiz);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
