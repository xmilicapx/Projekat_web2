namespace Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; } = 0;

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { set; get; } = string.Empty;

        public string Image { set; get; } = string.Empty;

        public UserDto() { }

        public UserDto(int id, string username, string password, string email, string role, string image)
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
