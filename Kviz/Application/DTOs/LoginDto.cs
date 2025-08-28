namespace Application.DTOs
{
    public class LoginDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";

        public LoginDto() { }

        public LoginDto(string username, string password)
        {
            Username = username;
            Password = password;
        }
    }
}
