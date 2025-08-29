namespace Application.Utilities
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpiryMinutes { get; set; }

        public JwtSettings() { }

        public JwtSettings(string secretKey, string issuer, string audience, int expiryMinutes)
        {
            SecretKey = secretKey;
            Issuer = issuer;
            Audience = audience;
            ExpiryMinutes = expiryMinutes;
        }
    }
}
