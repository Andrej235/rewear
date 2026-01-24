using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.InventoryItem;

public class AddStockRequestDto
{
    public Guid ClothingItemId { get; set; }
    public int Quantity { get; set; }

    public ClothingCategory Category { get; set; }

    // Only those size properties that are relevant to the clothing item's category will be populated
    public string? TopSize { get; set; }
    public string? BottomWaistSize { get; set; }
    public string? BottomLengthSize { get; set; }
    public string? ShoeSize { get; set; }
}
