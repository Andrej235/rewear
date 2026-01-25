using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.ClothingItem;

public class AdminClothingItemResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;

    public ClothingCategory Category { get; set; }
    public GenderTarget GenderTarget { get; set; }

    public Style PrimaryStyle { get; set; }
    public IEnumerable<Style> SecondaryStyles { get; set; } = [];

    public IEnumerable<Color> Colors { get; set; } = [];
    public Fit FitType { get; set; }
    public Season Season { get; set; }

    public Material Material { get; set; }
    public string BrandName { get; set; } = null!;

    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public int Stock { get; set; }
    public DateTime? LastEmbeddingGeneratedAt { get; set; }
}
