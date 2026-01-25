using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.InventoryItem;

public class AdminInventoryItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ClothingItemId { get; set; }

    public ClothingCategory Category { get; set; }

    // Only those size properties that are relevant to the clothing item's category will be populated
    public string? TopSize { get; set; }
    public string? BottomWaistSize { get; set; }
    public string? BottomLengthSize { get; set; }
    public string? ShoeSize { get; set; }

    public InventoryItemCondition Condition { get; set; }
    public InventoryItemStatus Status { get; set; }

    public int TimesRented { get; set; }
    public DateTime LastCleanedAt { get; set; }
    public DateTime AddedAt { get; set; }
}
