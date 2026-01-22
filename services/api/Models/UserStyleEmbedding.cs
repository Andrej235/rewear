using Pgvector;

namespace ReWear.Models;

public class UserStyleEmbedding
{
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;

    public Vector Embedding { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}
