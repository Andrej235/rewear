namespace ReWear.Dtos.Response.ClothingItem;

public class ClothingItemPreviewResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
}
