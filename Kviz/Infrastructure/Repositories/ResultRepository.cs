using Infrastructure.Data.Contexts;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ResultRepository : IResultRepository
    {
        private readonly ResultDbContext _context;
        private readonly DbSet<Result> _results;

        public ResultRepository(ResultDbContext context)
        {
            _context = context;
            _results = _context.Results;
        }

        public async Task<IEnumerable<Result>> GetAllAsync()
        {
            try
            {
                return await _results.AsNoTracking().ToListAsync();
            }
            catch
            {
                return new List<Result>();
            }
        }

        public async Task<Result?> AddAsync(Result result)
        {
            try
            {
                await _results.AddAsync(result);
                await _context.SaveChangesAsync();
                return result;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<Result>> GetByUsernameAsync(string username)
        {
            try
            {
                return await _results
                    .Where(r => r.Username == username)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch
            {
                return new List<Result>();
            }
        }
    }
}
