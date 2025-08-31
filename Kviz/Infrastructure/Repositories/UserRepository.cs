using Infrastructure.Data.Contexts;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDbContext _context;
        private readonly DbSet<User> _users;

        public UserRepository(UserDbContext context)
        {
            _context = context;
            _users = _context.Users;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            try
            {
                return await _users.AsNoTracking().ToListAsync();
            }
            catch
            {
                return new List<User>();
            }
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            try
            {
                return await _users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            }
            catch
            {
                return null;
            }
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            try
            {
                return await _users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
            }
            catch
            {
                return null;
            }
        }

        public async Task<User?> AddAsync(User user)
        {
            try
            {
                await _users.AddAsync(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch
            {
                return null;
            }
        }

        public async Task<User?> UpdateAsync(User user)
        {
            try
            {
                _users.Update(user);
                await _context.SaveChangesAsync();
                return user;
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
                var user = await _users.FindAsync(id);
                if (user == null) return false;

                _users.Remove(user);
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
