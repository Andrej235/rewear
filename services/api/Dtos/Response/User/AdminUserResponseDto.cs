namespace ReWear.Dtos.Response.User;

public class AdminUserResponseDto
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool Verified { get; set; }
    public DateTime JoinedAt { get; set; }

    public string SubscriptionPlanName { get; set; } = null!;
    public DateTime? LastEmbeddingGeneratedAt { get; set; }
}
