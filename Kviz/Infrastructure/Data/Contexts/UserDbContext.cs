using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Contexts
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
    }
}
