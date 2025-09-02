using Infrastructure.Models;

namespace Infrastructure.Interfaces
{
    public interface IQuizRepository
    {
        Task<IEnumerable<Quiz>> GetAllAsync();
        Task<Quiz?> GetByIdAsync(int id);
        Task<Quiz?> AddAsync(Quiz quiz);
        Task<Quiz?> UpdateAsync(Quiz quiz);
        Task<bool> DeleteAsync(int id);
    }
}
