using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    [Index(nameof(Username), IsUnique = true)]
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } = 0;

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { set; get; } = string.Empty;

        public string Image { set; get; } = string.Empty;

        public User() { }

        public User(int id, string username, string password, string email, string role, string image)
        {
            Id = id;
            Username = username;
            Password = password;
            Email = email;
            Role = role;
            Image = image;
        }
    }
}
