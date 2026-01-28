using ReWear.Dtos.Response.ClothingItem;

namespace ReWear.Dtos.Response.DeliveryBox;

public class DeliveryBoxItemResponseDto
{
    public bool ChosenByAi { get; set; }

    public ClothingItemPreviewResponseDto ClothingItem { get; set; } = null!;
    public InventoryItemResponseDto InventoryItem { get; set; } = null!;
}
