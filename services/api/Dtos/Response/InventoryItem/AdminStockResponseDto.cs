using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.InventoryItem;

public class AdminStockResponseDto
{
    public Guid ClothingItemId { get; set; }
    public string ClothingItemName { get; set; } = null!;
    public ClothingCategory Category { get; set; }

    public IEnumerable<AdminInventoryItemResponseDto> InventoryItems { get; set; } = null!;
}
