using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Contexts
{
    public class ResultDbContext(DbContextOptions<ResultDbContext> options) : DbContext(options)
    {
        public DbSet<Result> Results { get; set; }
    }
}
