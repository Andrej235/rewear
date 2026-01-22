using Pgvector;

namespace ReWear.Models;

public class ClothingItemEmbedding
{
    public Guid ClothingItemId { get; set; }
    public ClothingItem ClothingItem { get; set; } = null!;

    public Vector Embedding { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}
