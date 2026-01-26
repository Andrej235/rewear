namespace ReWear.Dtos.Response.User;

public class UserResponseDto
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public bool IsEmailVerified { get; set; }
    public bool HasSubscription { get; set; }
}
